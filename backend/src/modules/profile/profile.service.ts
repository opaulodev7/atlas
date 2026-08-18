import { prisma } from '../../prisma/client';
import { UpdateProfileInput, OnboardingInput } from './profile.dto';
import { logTimelineEvent } from '../../utils/timeline.logger';

export class ProfileService {
  static async getProfile(userId: string) {
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

  static async updateProfile(userId: string, input: UpdateProfileInput) {
    const { name, ...profileData } = input;

    if (name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: name.trim() },
      });
    }

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData,
      },
    });

    const updatedUser = await this.getProfile(userId);
    return updatedUser;
  }

  static async completeOnboarding(userId: string, input: OnboardingInput) {
    const { name, profession, bio, personalGoals, values, interests, skills, currentSituation, focusAreas, primaryObstacle } = input;

    if (name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: name.trim() },
      });
    }

    const combinedBio = [
      bio,
      currentSituation ? `Situação Atual: ${currentSituation}` : '',
      focusAreas ? `Áreas de Foco: ${focusAreas}` : '',
      primaryObstacle ? `Principal Desafio: ${primaryObstacle}` : '',
    ].filter(Boolean).join('\n\n');

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        profession: profession || '',
        bio: combinedBio || bio || '',
        personalGoals: personalGoals || '',
        values: values || '',
        interests: interests || '',
        skills: skills || '',
        onboardingCompleted: true,
      },
      create: {
        userId,
        profession: profession || '',
        bio: combinedBio || bio || '',
        personalGoals: personalGoals || '',
        values: values || '',
        interests: interests || '',
        skills: skills || '',
        onboardingCompleted: true,
      },
    });

    await logTimelineEvent({
      userId,
      type: 'CUSTOM',
      title: 'Onboarding Concluído',
      description: 'Perfil inicial e contexto pessoal configurados com sucesso.',
    });

    return await this.getProfile(userId);
  }
}
