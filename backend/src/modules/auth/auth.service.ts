import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../../prisma/client';
import { config } from '../../config';
import { RegisterInput, LoginInput } from './auth.dto';
import { logTimelineEvent } from '../../utils/timeline.logger';

const DEFAULT_LIFE_AREAS = [
  { name: 'Carreira', description: 'Trabalho, profissão, promoções e liderança', color: '#3b82f6', icon: 'Briefcase' },
  { name: 'Estudos', description: 'Faculdade, cursos, leitura técnica e aprendizados', color: '#8b5cf6', icon: 'GraduationCap' },
  { name: 'Finanças', description: 'Orçamento, reservas, investimentos e patrimônio', color: '#10b981', icon: 'DollarSign' },
  { name: 'Saúde', description: 'Exercício, alimentação, sono e saúde mental', color: '#ef4444', icon: 'Heart' },
  { name: 'Projetos', description: 'Projetos pessoais, negócios e iniciativas autorais', color: '#f59e0b', icon: 'FolderKanban' },
  { name: 'Relacionamentos', description: 'Família, amigos, networking e vida social', color: '#ec4899', icon: 'Users' },
  { name: 'Desenvolvimento Pessoal', description: 'Autoconhecimento, inteligência emocional e hábitos', color: '#6366f1', icon: 'Sparkles' },
  { name: 'Rotina', description: 'Organização diária, tarefas domésticas e rituais', color: '#14b8a6', icon: 'Clock' },
];

export class AuthService {
  static async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new Error('Já existe uma conta com este e-mail');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: input.name.trim(),
          email: input.email.toLowerCase().trim(),
          passwordHash,
          profile: {
            create: {
              profession: '',
              bio: '',
              personalGoals: '',
              values: '',
              interests: '',
              skills: '',
              onboardingCompleted: false,
            },
          },
          lifeAreas: {
            createMany: {
              data: DEFAULT_LIFE_AREAS.map((area) => ({
                name: area.name,
                description: area.description,
                color: area.color,
                icon: area.icon,
                status: 'ACTIVE',
              })),
            },
          },
        },
        include: {
          profile: true,
        },
      });

      return newUser;
    });

    await logTimelineEvent({
      userId: user.id,
      type: 'CUSTOM',
      title: 'Boas-vindas ao Atlas!',
      description: 'Conta criada com sucesso. Bem-vindo ao seu Sistema Operacional Pessoal.',
    });

    const signOptions: SignOptions = { expiresIn: config.jwtExpiresIn as any };
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      config.jwtSecret,
      signOptions
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        onboardingCompleted: user.profile?.onboardingCompleted ?? false,
      },
      token,
    };
  }

  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
      include: { profile: true },
    });

    if (!user) {
      throw new Error('E-mail ou senha incorretos');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('E-mail ou senha incorretos');
    }

    const signOptions: SignOptions = { expiresIn: config.jwtExpiresIn as any };
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      config.jwtSecret,
      signOptions
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        onboardingCompleted: user.profile?.onboardingCompleted ?? false,
      },
      token,
    };
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        profile: true,
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }
}
