const sonarqubeScanner = require('sonarqube-scanner');
sonarqubeScanner(
  {
    serverUrl: 'http://localhost:9000',
    options: {
      'sonar.sources': 'src',
      'sonar.language': 'ts',
      'sonar.login': 'admin',
      'sonar.password': 'admin123',
      'sonar.projectKey': 'ticket_order_srv',
      'sonar.inclusions': 'src/**', // Entry point of your code
    },
  },
  () => {}
);
