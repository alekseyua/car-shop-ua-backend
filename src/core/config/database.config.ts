export default () => ({
  NAME: process.env.DATABASE_NAME,
  USER: process.env.DATABASE_USER,
  PASSWORD: process.env.DATABASE_PASSWORD,
  HOST: process.env.DATABASE_HOST,
  PORT: process.env.DATABASE_PORT,
});
