// import dotenv from 'dotenv';
// dotenv.config();
// import app from './app';

// const PORT  = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`
//   ╔═══════════════════════════════════════╗
//   ║     uniThread CRM Backend Server      ║
//   ╠═══════════════════════════════════════╣
//   ║  Status:  Running                     ║
//   ║  Port:    ${PORT}                        ║
//   ║  Env:     ${process.env.NODE_ENV || 'development'}                 ║
//   ╚═══════════════════════════════════════╝
//     `);
// });

import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import redisClient from './config/redis';
import pubsubService from './pubsub/pubsub.service';
import leadEventsSubscriber from './pubsub/lead-events.subscriber';
import contactEventsSubscriber from "./pubsub/contact-events.subscriber";
import dealEventsSubscriber from "./pubsub/deal-events.subscriber";
import taskEventsSubscriber from "./pubsub/task-events.subscriber";
import noteEventsSubscriber from "./pubsub/note-events.subscriber";
import callEventsSubscriber from "./pubsub/call-events.subscriber";
import customerEventsSubscriber from "./pubsub/customer-events.subscriber";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await redisClient.connect();
    await pubsubService.connect();
    await leadEventsSubscriber.start();
    await contactEventsSubscriber.start();
    await dealEventsSubscriber.start();
    await taskEventsSubscriber.start();
    await noteEventsSubscriber.start();
    await callEventsSubscriber.start();
    await customerEventsSubscriber.start();


    const { default: app } = await import("./app");
    
    app.listen(PORT, () => {
      console.log(`
  ╔═══════════════════════════════════════╗
  ║     uniThread CRM Backend Server      ║
  ║  Status:  Running                     ║
  ║  Port:    ${PORT}                        ║
  ║  Env:     ${process.env.NODE_ENV || 'development'}                 ║
  ╚═══════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();