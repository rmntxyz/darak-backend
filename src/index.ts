import admin from "firebase-admin";
import { Message } from "firebase-admin/lib/messaging/messaging-api";

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    const serviceAccount = JSON.parse(process.env.GCS_FCM_SERVICE_ACCOUNT);

    module.exports = async () => {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      strapi.firebase = admin;
    };

    const firebase = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    //Make Firebase available everywhere
    strapi.firebase = firebase;

    const messaging = firebase.messaging();

    const sendNotification = (fcm, data) => {
      const message = {
        ...data,
        token: fcm,
      };
      return messaging
        .send(message)
        .then((res) => {
          console.log(res);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    const sendMulticastNotification = (fcms, data) => {
      const message = {
        ...data,
        tokens: fcms,
      };
      return messaging
        .sendEachForMulticast(message)
        .then((res) => {
          console.log(res);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    const sendNotificationToTopic = (topic_name, data) => {
      const message = {
        ...data,
        topic: topic_name,
      };
      return messaging
        .send(message)
        .then((res) => {
          console.log(res);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    const subscribeTopic = (fcm, topic_name) => {
      return messaging
        .subscribeToTopic(fcm, topic_name)
        .then((res) => {
          console.log(res);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    const unsubscribeTopic = (fcm, topic_name) => {
      return messaging
        .unsubscribeFromTopic(fcm, topic_name)
        .then((res) => {
          console.log(res);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    const sendEachNotification = (messages: Message[]) => {
      return messaging
        .sendEach(messages)
        .then((res) => {
          console.log(res);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    // optional. conditional topic

    //Make the notification functions available everywhere
    strapi.notification = {
      subscribeTopic,
      unsubscribeTopic,
      sendNotificationToTopic,
      sendNotification,
      sendMulticastNotification,
      sendEachNotification,
    };
  },
};
