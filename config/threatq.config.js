module.exports = {
  /**
   * ThreatQuotient Indicator Types:
   * 
   * Each threatQ instance has different IDs for typical indicators.  The following configuration property is used
   * to setup the unique IDs for each supported indicator type.  The supported indicator types are:
   *
   * ipv4, email, domain, md5, sha1, sha256, url, and ipv4cidr
   *
   * Each type should have a corresponding numeric ID.  If you are a threatQ admin you can find a list of types
   * navigating to the following URL after authenticating with your ThreatQ instance:
   *
   * https://<your-threatq-server>/api/indicator/types
   *
   * Note that if this endpoint returns an empty result `{}` your account does not have access to view the indicator
   * types.
   *
   * Please contact your ThreatQ administrator for these values if you are unable to access the above endpoint.
   *
   * Example Values:
   *
   * threatQIndicatorTypes: {
   *  ipv4: 11,
   *  email: 3,
   *  domain: 8,
   *  md5: 12,
   *  sha1: 16,
   *  sha256: 17,
   *  url: 21,
   *  ipv4cidr: 1
   * }
   */
  threatQIndicatorTypes: {
    ipv4: 11,
    email: 3,
    domain: 8,
    md5: 12,
    sha1: 16,
    sha256: 17,
    url: 21,
    ipv4cidr: 1
  }
};
