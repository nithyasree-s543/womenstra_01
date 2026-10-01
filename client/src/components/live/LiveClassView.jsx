import React, { useState, useEffect, useRef } from 'react';
import {
  Video, VideoOff, Mic, MicOff, Hand, MessageSquare, Users,
  ShieldCheck, PhoneOff, PhoneCall, PhoneForwarded, Volume2,
  Sparkles, AlertTriangle, Eye, RefreshCw, CheckCircle2
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';
import { speechService } from '../../services/speechService';
import confetti from 'canvas-confetti';

const STUN_SERVERS = {
  iceServers: [
    { urls: import.meta.env.VITE_STUN_URL || 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    // TURN server from env (needed for strict NAT)
    ...(import.meta.env.VITE_TURN_URL ? [{
      urls: import.meta.env.VITE_TURN_URL,
      username: import.meta.env.VITE_TURN_USERNAME || '',
      credential: import.meta.env.VITE_TURN_CREDENTIAL || ''
    }] : [])
  ]
};

export const LiveClassView = ({ onLeave }) => {
  const { currentLang, t } = useLanguage();
  const { speak, narrateScreen } = useVoiceNarrator();
  const { user, activeDependent } = useAuth();

  // Call States: 'explain' | 'permission' | 'calling' | 'incoming' | 'in-call' | 'ended'
  const [callState, setCallState] = useState('explain');
  const [permissionError, setPermissionError] = useState(null); // { key: string, type: string }

  // Media Controls
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isLowBandwidthMode, setIsLowBandwidthMode] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // Caller / Callee Data
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [callStatusMessage, setCallStatusMessage] = useState('');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    narrateScreen(t('liveClass'));

    // Initialize Socket.IO connection
    const socket = io('/', { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.emit('register-user', {
      userId: user?.id || `user-${Date.now()}`,
      userName: user?.name || 'Sunita Devi',
      role: user?.role || 'learner'
    });

    // Listen for incoming calls
    socket.on('incoming-call', (data) => {
      setIncomingCallData(data);
      setCallState('incoming');
      speechService.playChime('ringtone');
      speak(`${data.callerName} is calling you for live video mentoring.`);
    });

    // Listen for call response
    socket.on('call-response-received', ({ calleeName, accepted }) => {
      if (accepted) {
        setCallState('in-call');
        setCallStatusMessage(`Connected with ${calleeName}`);
        speak(`Connected with ${calleeName}`);
        confetti({ particleCount: 50 });
      } else {
        setCallState('ended');
        setCallStatusMessage(`${calleeName} declined the call.`);
        speak(`${calleeName} is currently unavailable.`);
      }
    });

    // WebRTC Offer / Answer Relay
    socket.on('webrtc-offer-received', async ({ senderSocketId, offer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit('webrtc-answer', { targetSocketId: senderSocketId, answer });
      }
    });

    socket.on('webrtc-answer-received', async ({ answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('webrtc-ice-candidate-received', async ({ candidate }) => {
      if (peerConnectionRef.current && candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch { }
      }
    });

    socket.on('call-ended', () => {
      handleEndCall();
    });

    socket.on('hand-raised', ({ userName }) => {
      speak(`${userName} raised their hand with a question.`);
    });

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      socket.disconnect();
    };
  }, [user]);

  // Step 1: Request Camera & Microphone Permissions
  const handleRequestPermissions = async () => {
    setPermissionError(null);
    setCallState('permission'); // show loading state
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true
      });

      localStreamRef.current = stream;
      // Show live preview immediately after permission granted
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => { });
      }

      setCallState('in-call');
      speak("Camera and microphone connected. You can see yourself now.");
      setupWebRTCConnection(stream);
    } catch (err) {
      console.warn('Media devices error:', err.name, err.message);
      // Map error names to specific i18n keys
      let errorKey = 'cameraUnknownError';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorKey = 'cameraNotAllowed';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorKey = 'cameraNotFound';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorKey = 'cameraInUse';
      }
      setPermissionError({ key: errorKey, type: err.name });
      setCallState('permission'); // stay on permission screen
      speak(t(errorKey));
    }
  };

  const setupWebRTCConnection = (localStream) => {
    try {
      const pc = new RTCPeerConnection(STUN_SERVERS);
      peerConnectionRef.current = pc;

      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('webrtc-ice-candidate', {
            targetSocketId: incomingCallData?.callerSocketId,
            candidate: event.candidate
          });
        }
      };
    } catch (err) {
      console.warn('WebRTC peer error:', err);
    }
  };

  const handleStartCallToMentor = () => {
    setCallState('calling');
    setCallStatusMessage("Calling Dr. Ananya Sharma (Mentor)...");
    speak("Calling mentor. Please wait while connecting...");

    if (socketRef.current) {
      socketRef.current.emit('call-user', {
        callerId: user?.id || 'user-1',
        callerName: user?.name || 'Sunita Devi',
        calleeId: 'mentor-1',
        callType: 'video',
        isMinor: !!activeDependent
      });
    }

    // Auto connect fallback simulation
    setTimeout(() => {
      handleRequestPermissions();
    }, 1800);
  };

  const handleAcceptIncomingCall = () => {
    if (incomingCallData && socketRef.current) {
      socketRef.current.emit('call-response', {
        callerSocketId: incomingCallData.callerSocketId,
        callerId: incomingCallData.callerId,
        calleeName: user?.name || 'Sunita Devi',
        accepted: true
      });
      handleRequestPermissions();
    }
  };

  const handleDeclineIncomingCall = () => {
    if (incomingCallData && socketRef.current) {
      socketRef.current.emit('call-response', {
        callerSocketId: incomingCallData.callerSocketId,
        callerId: incomingCallData.callerId,
        calleeName: user?.name || 'Sunita Devi',
        accepted: false
      });
      setCallState('ended');
    }
  };

  const handleToggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !isMicOn;
        setIsMicOn(!isMicOn);
        speak(!isMicOn ? "Microphone enabled" : "Microphone muted");
      }
    }
  };

  const handleToggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
        speak(!isVideoOn ? "Camera turned on" : "Camera turned off");
      }
    }
  };

  const handleToggleLowBandwidth = () => {
    const next = !isLowBandwidthMode;
    setIsLowBandwidthMode(next);
    if (next) {
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(t => (t.enabled = false));
      }
      setIsVideoOn(false);
      speak("2G Low-bandwidth audio mode enabled to save internet data.");
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(t => (t.enabled = true));
      }
      setIsVideoOn(true);
      speak("Video mode restored.");
    }
  };

  const handleRaiseHand = () => {
    const next = !isHandRaised;
    setIsHandRaised(next);
    if (next) {
      if (socketRef.current) {
        socketRef.current.emit('raise-hand', { userName: user?.name || 'Sunita Devi' });
      }
      confetti({ particleCount: 40 });
      speak("You raised your hand. Mentor has been notified.");
    }
  };

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (socketRef.current && incomingCallData?.callerSocketId) {
      socketRef.current.emit('end-call', { targetSocketId: incomingCallData.callerSocketId });
    }
    setCallState('ended');
    speak("Call ended safely.");
  };

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto px-3 sm:px-4 pt-2">

      {/* 1. Header Bar with Minor Protection Notice */}
      <div className="bg-slate-900 rounded-3xl p-4 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black animate-pulse">
            LIVE
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black tracking-tight">
              WebRTC Mentoring Room: Dr. Ananya Sharma
            </h2>
            <p className="text-[11px] text-slate-400">
              STUN/WebRTC Signaling Online • Low Latency 2G Audio Ready
            </p>
          </div>
        </div>

        <button
          onClick={onLeave}
          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 touch-target-large"
        >
          <PhoneOff className="w-4 h-4" />
          <span>{t('endCall')}</span>
        </button>
      </div>

      {/* Minor Observer Protection Notice */}
      {activeDependent && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-between text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-xs font-bold">{t('guardianMinorNotice')}</p>
              <p className="text-[10px] opacity-80">
                Child safety session for {activeDependent.name} (Age {activeDependent.age})
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-md">
            Protected ✓
          </span>
        </div>
      )}

      {/* 2a. EXPLAIN Screen: tell the user WHY camera is needed before asking */}
      {callState === 'explain' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-purple-100 dark:border-slate-800 shadow-xl text-center space-y-5 max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center mx-auto text-4xl">
            📹
          </div>
          <div>
            <h3 className="text-lg font-black text-purple-950 dark:text-white">
              {t('cameraWhyTitle')}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              {t('cameraWhyDesc')}
            </p>
          </div>
          <button
            onClick={() => { setCallState('permission'); handleRequestPermissions(); }}
            className="w-full py-4 bg-womentra-gradient text-white rounded-2xl font-black text-sm shadow-md shadow-pink-500/20 hover:opacity-95 transition-all touch-target-large"
          >
            {t('allowCamera')} ✓
          </button>
          <button
            onClick={onLeave}
            className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold"
          >
            {t('endCall')}
          </button>
        </div>
      )}

      {/* 2b. Permission Request / Error State */}
      {callState === 'permission' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-purple-100 dark:border-slate-800 shadow-xl text-center space-y-5 max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center mx-auto text-3xl">
            📷
          </div>
          <div>
            <h3 className="text-lg font-black text-purple-950 dark:text-white">
              {t('cameraPermissionTitle')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {t('cameraPermissionDesc')}
            </p>
          </div>

          {/* Specific error message by type */}
          {permissionError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-left space-y-2">
              <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                ⚠️ {t(permissionError.key)}
              </p>
              {permissionError.type && (
                <p className="text-[10px] text-rose-500 dark:text-rose-400 font-mono">
                  ({permissionError.type})
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={handleRequestPermissions}
              className="w-full py-4 bg-womentra-gradient text-white rounded-2xl font-black text-sm shadow-md shadow-pink-500/20 hover:opacity-95 transition-all touch-target-large"
            >
              {permissionError ? t('retryCamera') : t('allowCamera')} ✓
            </button>

            <button
              onClick={handleStartCallToMentor}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md"
            >
              Call Assigned Mentor Directly 📞
            </button>
          </div>
        </div>
      )}

      {/* 3. Incoming Call Screen Overlay */}
      {callState === 'incoming' && incomingCallData && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-emerald-500 shadow-2xl text-center space-y-6 max-w-md mx-auto animate-in zoom-in-95">
          <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-4xl animate-bounce ring-8 ring-emerald-50">
            📞
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
              {t('incomingCall')}
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {incomingCallData.callerName}
            </h3>
            <p className="text-xs text-slate-500">Live 1:1 Video Mentoring</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDeclineIncomingCall}
              className="py-3.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-2xl font-black text-xs"
            >
              {t('declineCall')} ✕
            </button>
            <button
              onClick={handleAcceptIncomingCall}
              className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-600/30"
            >
              {t('acceptCall')} ✓
            </button>
          </div>
        </div>
      )}

      {/* 4. Active In-Call WebRTC Video Stage */}
      {callState === 'in-call' && (
        <div className="space-y-4">

          <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 border-2 border-purple-900 shadow-2xl flex items-center justify-center">

            {/* Remote Mentor Feed */}
            {isLowBandwidthMode ? (
              <div className="text-center p-6 space-y-3">
                <div className="w-20 h-20 rounded-full bg-womentra-gradient flex items-center justify-center mx-auto text-3xl animate-voice-listening">
                  👩🏽‍🏫
                </div>
                <h3 className="text-base font-black text-white">Dr. Ananya Sharma (Live Audio)</h3>
                <span className="text-xs text-emerald-400 font-bold">
                  ● 2G Low Bandwidth Mode Active (Zero Lag)
                </span>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80"
                  alt="Mentor Video Stream"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Live Caption Subtitle Banner in Selected Language */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center">
                  <p className="text-xs sm:text-sm font-bold text-amber-300">
                    "Welcome! In today's session, let's review your HTML responsive layout project."
                  </p>
                </div>

                <div className="absolute top-4 left-4 bg-purple-900/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white border border-purple-500/30">
                  👩🏽‍🏫 Dr. Ananya Sharma (Mentor)
                </div>
              </div>
            )}

            {/* Self Video PIP (Picture-In-Picture) */}
            <div className="absolute top-4 right-4 w-28 sm:w-36 aspect-video rounded-2xl overflow-hidden bg-slate-800 border-2 border-white/40 shadow-lg">
              {isVideoOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-400 text-xs font-bold">
                  <VideoOff className="w-5 h-5" />
                </div>
              )}
            </div>

          </div>

          {/* 5. In-Call Control Dock (Large Touch Targets) */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-purple-100 dark:border-slate-800 shadow-lg flex items-center justify-around gap-2">

            {/* Toggle Mic */}
            <button
              onClick={handleToggleMic}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl touch-target-large transition-all ${isMicOn
                  ? 'bg-purple-50 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200'
                }`}
            >
              {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              <span className="text-[10px] font-bold">{isMicOn ? t('muteMic') : t('unmuteMic')}</span>
            </button>

            {/* Toggle Camera */}
            <button
              onClick={handleToggleVideo}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl touch-target-large transition-all ${isVideoOn
                  ? 'bg-purple-50 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
            >
              {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              <span className="text-[10px] font-bold">{isVideoOn ? t('cameraOn') : t('cameraOff')}</span>
            </button>

            {/* Raise Hand by Voice */}
            <button
              onClick={handleRaiseHand}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl touch-target-large transition-all ${isHandRaised
                  ? 'bg-amber-100 text-amber-900 border-2 border-amber-500 animate-bounce'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
            >
              <Hand className="w-6 h-6" />
              <span className="text-[10px] font-bold">{isHandRaised ? 'Hand Raised' : t('raiseHand')}</span>
            </button>

            {/* 2G Low Bandwidth Audio Toggle */}
            <button
              onClick={handleToggleLowBandwidth}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl touch-target-large transition-all ${isLowBandwidthMode
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
            >
              <Volume2 className="w-6 h-6" />
              <span className="text-[10px] font-bold">{isLowBandwidthMode ? '2G Audio ON' : t('audioOnlyMode')}</span>
            </button>

            {/* End Call */}
            <button
              onClick={handleEndCall}
              className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white touch-target-large transition-all shadow-md shadow-rose-600/30"
            >
              <PhoneOff className="w-6 h-6" />
              <span className="text-[10px] font-bold">{t('endCall')}</span>
            </button>

          </div>

        </div>
      )}

      {/* 5. Ended Screen */}
      {callState === 'ended' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-purple-100 dark:border-slate-800 shadow-md text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center mx-auto text-3xl">
            👋
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Call Finished
          </h3>
          <p className="text-xs text-slate-500">
            {callStatusMessage || "Your mentoring session was completed safely."}
          </p>
          <button
            onClick={() => setCallState('permission')}
            className="w-full py-3.5 bg-womentra-gradient text-white rounded-2xl font-black text-xs shadow-md"
          >
            Start New Call
          </button>
        </div>
      )}

    </div>
  );
};
