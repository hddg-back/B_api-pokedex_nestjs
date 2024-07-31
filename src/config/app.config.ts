export const ConfigEnv = () => ({
  env: process.env.NODE_ENV || 'dev',
  mongodb: process.env.MONGODB,
  port: process.env.PORT || 3000,
  defaultLimitPagination: process.env.DEFAUL_LIMIT_PAGINATION || 8,
});
