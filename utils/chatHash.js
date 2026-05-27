import crypto from 'crypto';

const createChatHash = (u1, u2) =>
  crypto.createHash('sha256').update([u1, u2].sort().join('-')).digest('hex');

export default createChatHash;
