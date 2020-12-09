const IGNORED_IPS = new Set(['127.0.0.1', '255.255.255.255', '0.0.0.0']);

const ENTITY_DISPLAY_TYPES = {
  domain: 'domain',
  IPv4CIDR: 'ipv4cidr',
  IPv4: 'ip',
  IPv6: 'ip',
  email: 'email',
  MD5: 'md5',
  SHA1: 'sha1',
  SHA256: 'sha256'
};
module.exports = {
  IGNORED_IPS,
  ENTITY_DISPLAY_TYPES
};
