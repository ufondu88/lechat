import { FindManyOptions, FindOptionsWhere, Repository } from "typeorm";
import { BaseController } from "./base.controller";

export class BaseTypeORMService<RepoType> extends BaseController {
  entity: string
  repository: Repository<RepoType>

  constructor(context: string, entity: string, repository: Repository<RepoType>) {
    super(context)

    this.entity = entity
    this.repository = repository
  }

  /**
   * Retrieves all entities with optional relations.
   *
   * @param relations - Array of relation names to include in the result.
   * @returns Array of entities.
   */
  findAll(relations: string[] = []): Promise<RepoType[]> {
    return this.repository.find({ relations });
  }

  /**
   * Retrieves a entity based on the provided ID.
   *
   * @param criteria - Object containing the criteria for finding the community.
   * @returns The found entity or undefined if not found.
   */
  async findOneBy(criteria: { id?: string; name?: string; email?: string }): Promise<RepoType | undefined> {
    for (const property in criteria) {
      if (criteria[property.toString()]) {
        this.logger.log(`Looking for user by ${property.toString()}: ${criteria[property]}`)
      }
    }

    return await this.repository.findOneBy(criteria as FindOptionsWhere<unknown>);
  }

  /**
   * Retrieves multiple entities based on the provided criteria.
   * 
   * @param ids - Array of user IDs to retrieve.
   * @returns A promise that resolves to an array of found entities.
   */
  findManyById(ids: string[]) {
    try {
      this.logger.log(`Getting ${this.entity}s: ${ids}`);
      const where = ids.map((id) => ({ id }));
      return this.repository.find({ where } as FindManyOptions<unknown>);
    } catch (error) {
      this.logger.error(`Error retrieving ${this.entity}s: ${error.message}`);
    }
  }

}