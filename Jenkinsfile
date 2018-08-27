pipeline {
  agent {
    dockerfile {
      filename 'dockerfile-tester'
    }

  }
  stages {
    stage('first-stage') {
      steps {
        git(url: 'https://github.com/kendaop/unicorn-manager', branch: 'master')
      }
    }
  }
}