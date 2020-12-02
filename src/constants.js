const IGNORED_IPS = new Set(['127.0.0.1', '255.255.255.255', '0.0.0.0']);

const TYPES_FOR_QUERY = {
  IPv4CIDR: 'ipv4cidr',
  IPv4: 'ipv4',
  IPv6: 'ipv6',
  domain: 'domain',
  email: 'email',
  MD5: 'md5',
  SHA1: 'sha1',
  SHA256: 'sha256'
};

// TODO: Modify display types as needed
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
  TYPES_FOR_QUERY,
  ENTITY_DISPLAY_TYPES
};
