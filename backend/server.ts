import app from './src/app';
import { config } from './src/config/env';
import { connectToDatabase } from './src/config/db';

const startServer = async () => {
  await connectToDatabase();

  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Express API listening on port ${config.port}`);
  });
};

void startServer();

