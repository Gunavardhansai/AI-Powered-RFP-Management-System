require('dotenv').config();
const { app } = require('./app');
const { logger } = require('./lib/logger');

const port = process.env.PORT || 4000;
app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
