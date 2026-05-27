import agoraAccessToken from 'agora-access-token';
const { RtcTokenBuilder, RtcRole } = agoraAccessToken;

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERT;

const buildTokenPayload = ({ channelName, role, uid }) => {
  if (!channelName) throw new Error('channelName is required');
  if (!APP_ID || !APP_CERTIFICATE) throw new Error('Agora credentials not configured');

  const parsedUid = Number(uid ?? 0);
  const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
  const privilegeExpiredTs = Math.floor(Date.now() / 1000) + 3600;

  const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, parsedUid, agoraRole, privilegeExpiredTs);

  return { token, appId: APP_ID, channelName, uid: parsedUid, role: agoraRole === RtcRole.PUBLISHER ? 'publisher' : 'subscriber', expiresIn: 3600 };
};

export const generateAgoraToken = (req, res) => {
  try {
    const payload = buildTokenPayload({ channelName: req.params.channelName, role: req.params.role, uid: req.params.uid });
    return res.status(200).json({ ...payload, message: 'Token generated successfully' });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to generate token' });
  }
};

export const generateAgoraTokenFromBody = (req, res) => {
  try {
    const payload = buildTokenPayload({ channelName: req.body?.channelName, role: req.body?.role || 'publisher', uid: req.body?.uid ?? 0 });
    return res.status(200).json({ ...payload, message: 'Token generated successfully' });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to generate token' });
  }
};
