module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    // Admin application
    {
      name      : 'shop',
      script    : 'app.js',
      env: {
        PORT: 4000
      },
      env_production : {
        NODE_ENV: 'production'
      }
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : 'batas',
      host : 'battery.msk.ru',
      ref  : 'origin/master',
      repo : 'https://github.com/finkvi/batas-shop.git',
      path : '/home/batas/batas-shop',
      
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
