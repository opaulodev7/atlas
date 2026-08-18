import app from './app';
import { config } from './config';
import { prisma } from './prisma/client';

async function bootstrap() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Conexão com o banco de dados PostgreSQL estabelecida com sucesso.');

    app.listen(config.port, '0.0.0.0', () => {
      console.log(`🚀 Servidor Atlas API rodando na porta ${config.port}`);
      console.log(`📍 Endpoint de saúde: http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    console.error('❌ Falha crítica ao iniciar o servidor:', error);
    process.exit(1);
  }
}

bootstrap();
