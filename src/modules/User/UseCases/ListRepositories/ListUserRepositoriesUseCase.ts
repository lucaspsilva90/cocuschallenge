import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';

import { IGitHubService } from '../../../../services/GitHubService/IGitHubService';
import { Branch } from '../../Entities/Branch';
import { Repository } from '../../Entities/Repository';

@injectable()
class ListUserRepositoriesUseCase {
  constructor(
    @inject('GitHubService')
    private gitHubService: IGitHubService,
  ) { }

  async getAndParseBranchData(user: string, repository: string) {
    const { data } = await this.gitHubService.searchBranchesByName(user, repository);
    const branchData = data.map((branch: Branch) => ({
      name: branch.name,
      lastCommit: branch.commit.sha,
    }));
    return branchData;
  }

  async getAndParseUserData(user: string) {
    const { data } = await this.gitHubService.searchReposByUserName(user);

    const userData = await Promise.all(data.filter((repo: Repository) => !repo.fork)
      .map(async (repository: Repository) => ({
        ownerUsername: repository.owner.login,
        repositoryName: repository.name,
        branches: await this.getAndParseBranchData(user, repository.name),
      })));
    return userData;
  }

  async execute(user: string) {
    const response = this.getAndParseUserData(user);
    return response;
  }
}

export { ListUserRepositoriesUseCase };
