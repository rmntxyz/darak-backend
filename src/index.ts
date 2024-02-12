import admin from "firebase-admin";

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
    const serviceAccount = JSON.parse(process.env.GCS_SERVICE_ACCOUNT);

    module.exports = async () => {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      strapi.firebase = admin;
    };

    let firebase = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    //Make Firebase available everywhere
    strapi.firebase = firebase;

    let messaging = firebase.messaging();

    let sendNotification = (fcm, data) => {
      let message = {
        ...data,
        token: fcm,
      };
      messaging
        .send(message)
        .then((res) => {
          console.log(res);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    let sendMulticastNotification = (fcms, data) => {
      let message = {
        ...data,
        tokens: fcms,
      };
      messaging
        .sendEachForMulticast(message)
        .then((res) => {
          console.log(res);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    let sendNotificationToTopic = (topic_name, data) => {
      let message = {
        ...data,
        topic: topic_name,
      };
      messaging
        .send(message)
        .then((res) => {
          console.log(res);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    let subscribeTopic = (fcm, topic_name) => {
      messaging
        .subscribeToTopic(fcm, topic_name)
        .then((res) => {
          console.log(res);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    let unsubscribeTopic = (fcm, topic_name) => {
      messaging
        .unsubscribeFromTopic(fcm, topic_name)
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
    };
  },
};
