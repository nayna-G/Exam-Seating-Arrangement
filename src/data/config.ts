// System Configuration
export interface SystemConfig {
  // Seating algorithm settings
  seatingAlgorithm: 'random' | 'optimized' | 'balanced';
  maxStudentsPerRoom: number;
  minDistanceBetweenStudents: number;
  
  // Exam settings
  defaultExamDuration: number; // in minutes
  bufferTimeBetweenExams: number; // in minutes
  maxExamsPerDay: number;
  
  // Security settings
  enableQRCodeGeneration: boolean;
  enableSeatLocking: boolean;
  seatLockDuration: number; // in minutes
  
  // Notification settings
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
  notificationAdvanceTime: number; // in hours
  
  // System settings
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  
  // Backup settings
  enableAutoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  maxBackupFiles: number;
}

// Default system configuration
export const defaultConfig: SystemConfig = {
  // Seating algorithm settings
  seatingAlgorithm: 'optimized',
  maxStudentsPerRoom: 50,
  minDistanceBetweenStudents: 1,
  
  // Exam settings
  defaultExamDuration: 180, // 3 hours
  bufferTimeBetweenExams: 30, // 30 minutes
  maxExamsPerDay: 3,
  
  // Security settings
  enableQRCodeGeneration: true,
  enableSeatLocking: true,
  seatLockDuration: 15, // 15 minutes
  
  // Notification settings
  enableEmailNotifications: true,
  enableSMSNotifications: false,
  notificationAdvanceTime: 24, // 24 hours
  
  // System settings
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm',
  language: 'en',
  
  // Backup settings
  enableAutoBackup: true,
  backupFrequency: 'daily',
  maxBackupFiles: 30
};

// Configuration management class
export class ConfigManager {
  private config: SystemConfig = { ...defaultConfig };

  // Get current configuration
  getConfig(): SystemConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(updates: Partial<SystemConfig>): SystemConfig {
    this.config = { ...this.config, ...updates };
    return this.getConfig();
  }

  // Reset to default configuration
  resetToDefault(): SystemConfig {
    this.config = { ...defaultConfig };
    return this.getConfig();
  }

  // Get specific configuration value
  getConfigValue<K extends keyof SystemConfig>(key: K): SystemConfig[K] {
    return this.config[key];
  }

  // Set specific configuration value
  setConfigValue<K extends keyof SystemConfig>(key: K, value: SystemConfig[K]): void {
    this.config[key] = value;
  }

  // Validate configuration
  validateConfig(config: SystemConfig): string[] {
    const errors: string[] = [];

    if (config.maxStudentsPerRoom <= 0) {
      errors.push('Max students per room must be greater than 0');
    }

    if (config.minDistanceBetweenStudents < 0) {
      errors.push('Minimum distance between students cannot be negative');
    }

    if (config.defaultExamDuration <= 0) {
      errors.push('Default exam duration must be greater than 0');
    }

    if (config.bufferTimeBetweenExams < 0) {
      errors.push('Buffer time between exams cannot be negative');
    }

    if (config.maxExamsPerDay <= 0) {
      errors.push('Max exams per day must be greater than 0');
    }

    if (config.seatLockDuration < 0) {
      errors.push('Seat lock duration cannot be negative');
    }

    if (config.notificationAdvanceTime < 0) {
      errors.push('Notification advance time cannot be negative');
    }

    if (config.maxBackupFiles <= 0) {
      errors.push('Max backup files must be greater than 0');
    }

    return errors;
  }

  // Export configuration to JSON
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  // Import configuration from JSON
  importConfig(configJson: string): boolean {
    try {
      const importedConfig = JSON.parse(configJson);
      const errors = this.validateConfig(importedConfig);
      
      if (errors.length === 0) {
        this.config = { ...importedConfig };
        return true;
      } else {
        console.error('Configuration validation errors:', errors);
        return false;
      }
    } catch (error) {
      console.error('Error importing configuration:', error);
      return false;
    }
  }
}

// Export singleton instance
export const configManager = new ConfigManager();

// Utility functions for configuration
export const configUtils = {
  // Format date according to system configuration
  formatDate: (date: Date): string => {
    const config = configManager.getConfig();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: config.timezone,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    return date.toLocaleDateString(config.language, options);
  },

  // Format time according to system configuration
  formatTime: (date: Date): string => {
    const config = configManager.getConfig();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: config.timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return date.toLocaleTimeString(config.language, options);
  },

  // Get current timezone offset
  getTimezoneOffset: (): number => {
    const config = configManager.getConfig();
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: config.timezone }));
    return (targetTime.getTime() - utc.getTime()) / 60000;
  },

  // Check if notifications are enabled
  isNotificationEnabled: (type: 'email' | 'sms'): boolean => {
    const config = configManager.getConfig();
    return type === 'email' ? config.enableEmailNotifications : config.enableSMSNotifications;
  },

  // Get backup schedule
  getBackupSchedule: (): { frequency: string; interval: number } => {
    const config = configManager.getConfig();
    const intervals = {
      daily: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      weekly: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      monthly: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    };
    
    return {
      frequency: config.backupFrequency,
      interval: intervals[config.backupFrequency]
    };
  }
};
