
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useFirestore } from '@/firebase';
import { collection, doc, addDoc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export const useWebRTC = (
  localVideoRef: React.RefObject<HTMLVideoElement>,
  remoteVideoRef: React.RefObject<HTMLVideoElement>,
  currentUserId?: string
) => {
  const firestore = useFirestore();
  const pc = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const callIdRef = useRef<string | null>(null);

  const setupStreams = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error('Error accessing media devices.', error);
      return null;
    }
  }, [localVideoRef]);

  const startCall = useCallback(async (calleeId: string) => {
    const stream = await setupStreams();
    if (!stream || !currentUserId) return;

    pc.current = new RTCPeerConnection(servers);
    
    stream.getTracks().forEach((track) => {
      pc.current!.addTrack(track, stream);
    });

    const callDoc = await addDoc(collection(firestore, 'calls'), {
        offer: {
            uid: currentUserId,
            sdp: '',
            type: ''
        },
        answer: null,
    });
    callIdRef.current = callDoc.id;

    const offerCandidates = collection(callDoc, 'offerCandidates');
    const answerCandidates = collection(callDoc, 'answerCandidates');

    pc.current.onicecandidate = (event) => {
      event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
    };

    const offerDescription = await pc.current.createOffer();
    await pc.current.setLocalDescription(offerDescription);

    const offer = {
      uid: currentUserId,
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await updateDoc(callDoc, { offer });

    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!pc.current?.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.current!.setRemoteDescription(answerDescription);
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.current!.addIceCandidate(candidate);
        }
      });
    });

    pc.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    setIsInCall(true);

  }, [setupStreams, firestore, currentUserId]);

  const joinCall = useCallback(async (callId: string) => {
    const stream = await setupStreams();
    if (!stream) return;

    callIdRef.current = callId;
    pc.current = new RTCPeerConnection(servers);

    stream.getTracks().forEach((track) => {
        pc.current!.addTrack(track, stream);
    });
    
    const callDoc = doc(firestore, 'calls', callId);
    const answerCandidates = collection(callDoc, 'answerCandidates');
    const offerCandidates = collection(callDoc, 'offerCandidates');

    pc.current.onicecandidate = (event) => {
        event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
    };

    pc.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
    };

    const callSnapshot = await new Promise<any>((resolve) => onSnapshot(doc(firestore, 'calls', callId), resolve));
    const callData = callSnapshot.data();
    const offerDescription = new RTCSessionDescription(callData.offer);
    await pc.current.setRemoteDescription(offerDescription);

    const answerDescription = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answerDescription);

    const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
    };
    await updateDoc(callDoc, { answer });

    onSnapshot(offerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const candidate = new RTCIceCandidate(change.doc.data());
                pc.current!.addIceCandidate(candidate);
            }
        });
    });

    setIsInCall(true);

  }, [setupStreams, firestore]);

  const hangUp = useCallback(async () => {
    if (pc.current) {
        pc.current.getSenders().forEach(sender => {
            pc.current?.removeTrack(sender);
        });
        pc.current.close();
    }

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    
    if (callIdRef.current) {
        await deleteDoc(doc(firestore, 'calls', callIdRef.current));
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsInCall(false);
    callIdRef.current = null;
    pc.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

  }, [localStream, firestore, localVideoRef, remoteVideoRef]);

  const toggleMute = useCallback((isMuted: boolean) => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  }, [localStream]);

  const toggleVideo = useCallback((isVideoOff: boolean) => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoOff;
      });
    }
  }, [localStream]);

  return { startCall, joinCall, hangUp, localStream, remoteStream, isInCall, toggleMute, toggleVideo };
};

    