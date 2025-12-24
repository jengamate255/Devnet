// Validation utilities for Devnet forms

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateMAC = (mac) => {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(mac);
};

export const validateIP = (ip) => {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

export const validatePort = (port) => {
  const portNum = parseInt(port);
  return portNum >= 1 && portNum <= 65535;
};

export const validateNumeric = (value, min = 0, max = Infinity) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && String(value).trim().length > 0;
};

export const validateUser = (user) => {
  const errors = {};

  if (!validateRequired(user.name)) {
    errors.name = 'Name is required';
  }

  if (!validateRequired(user.mac)) {
    errors.mac = 'MAC address is required';
  } else if (!validateMAC(user.mac)) {
    errors.mac = 'Invalid MAC address format (XX:XX:XX:XX:XX:XX)';
  }

  if (user.ip && !validateIP(user.ip)) {
    errors.ip = 'Invalid IP address format';
  }

  if (user.uploadLimit && !validateNumeric(user.uploadLimit, 0)) {
    errors.uploadLimit = 'Upload limit must be a positive number';
  }

  if (user.downloadLimit && !validateNumeric(user.downloadLimit, 0)) {
    errors.downloadLimit = 'Download limit must be a positive number';
  }

  if (user.dataQuota && !validateNumeric(user.dataQuota, 0)) {
    errors.dataQuota = 'Data quota must be a positive number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateVoucher = (voucher) => {
  const errors = {};

  if (!validateRequired(voucher.duration)) {
    errors.duration = 'Duration is required';
  } else if (!validateNumeric(voucher.duration, 1, 8760)) { // Max 1 year in hours
    errors.duration = 'Duration must be between 1 and 8760 hours';
  }

  if (!validateRequired(voucher.bandwidth)) {
    errors.bandwidth = 'Bandwidth is required';
  } else if (!validateNumeric(voucher.bandwidth, 1, 1000)) { // Max 1000 Mbps
    errors.bandwidth = 'Bandwidth must be between 1 and 1000 Mbps';
  }

  if (voucher.quota && !validateNumeric(voucher.quota, 1)) {
    errors.quota = 'Quota must be a positive number';
  }

  if (!validateNumeric(voucher.quantity, 1, 1000)) {
    errors.quantity = 'Quantity must be between 1 and 1000';
  }

  if (voucher.deviceLimit && !validateNumeric(voucher.deviceLimit, 1, 10)) {
    errors.deviceLimit = 'Device limit must be between 1 and 10';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateRouterConfig = (config) => {
  const errors = {};

  if (!validateRequired(config.host)) {
    errors.host = 'Router IP address is required';
  } else if (!validateIP(config.host)) {
    errors.host = 'Invalid IP address format';
  }

  if (!validateRequired(config.username)) {
    errors.username = 'Username is required';
  }

  if (!validateRequired(config.password)) {
    errors.password = 'Password is required';
  }

  if (!validatePort(config.port)) {
    errors.port = 'Port must be between 1 and 65535';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
