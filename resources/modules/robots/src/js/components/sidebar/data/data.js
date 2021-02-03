export const dataAction =  {
  "type": "action",
  "nodeData": [
      {
          "type": "crud",
          "data": {
              "method": "update",
              "body": {
                  "name": "User",
                  "email": "awdad@mail.ru"
              },
              "model_class": "App\\User",
              "model_id": "4"
          }
      },
      {
          "type": "send_mail",
          "data": {
              "users": [
                  1,
                  2
              ],
              "subject": "New subject",
              "message": "Hello my old friend!"
          }
      },
      {
          "type": "send_notice",
          "data": {
              "users": [
                  3,
                  4
              ],
              "message": "Message has been sent."
          }
      }
  ]
};