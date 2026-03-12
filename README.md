Tschool.

jwt capabilities, none used tho. socketio as well for anonymously chatting. or we could add login, with jwts previously mentioned.

compiles static client and server to /build and /dist.

to run
npm i
npx sequelize db:migrate
npm run server:build
npm run client:build:dev
export JWT_SECRET=blahblah
npm run server
