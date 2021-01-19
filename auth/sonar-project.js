const sonarqubeScanner = require('sonarqube-scanner');
sonarqubeScanner(
  {
    serverUrl: 'http://localhost:9000',
    options: {
      'sonar.sources': 'src',
      'sonar.language': 'ts',
      'sonar.login': 'admin',
      'sonar.password': 'admin123',
      'sonar.projectKey': 'auth_srv',
      'sonar.tests': 'src',
      'sonar.test.inclusions': 'src/**/*.test.ts',
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
      'sonar.testExecutionReportPaths': 'coverage/test-reporter.xml',
      'sonar.inclusions': 'src/**', // Entry point of your code
    },
  },
  () => {}
);
