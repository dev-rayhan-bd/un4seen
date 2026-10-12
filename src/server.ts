process.env.TZ = 'Pacific/Auckland';

import { Server } from 'http';

import app from './app';

import mongoose from 'mongoose';
import config from './app/config';
import seedAdmin from './app/DB';
import 'dotenv/config';
import { initializeSocket } from './app/utils/socket';
import { UserModel } from './app/modules/User/user.model';
import { syncPointValues } from './app/modules/ShredPoints/points.constant';
import { checkAndDowngradeExpiredUsers } from './app/modules/Shopify/shopifySubscription.service';



let server: Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    await UserModel.updateMany({}, { isOnline: false });
 await seedAdmin(); 
    server = app.listen(config.port, () => {
      console.log(`app is listening on port ${config.port}`);
    });
  await syncPointValues();
    initializeSocket(server);

    // Initial check for expired subscription members
    checkAndDowngradeExpiredUsers().catch((err) =>
      console.error('Error running initial subscription expiration check:', err)
    );

    // Run expiration check every 1 hour
    setInterval(() => {
      checkAndDowngradeExpiredUsers().catch((err) =>
        console.error('Error running periodic subscription expiration check:', err)
      );
    }, 60 * 60 * 1000);
  } catch (err) {
    console.log(err);
  }
}
main();

process.on('unhandledRejection', (err) => {
  console.log(`😈 unahandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
