import { NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { BaseTypeORMService } from "./base-typeorm.service";

export class UpdaterService<RepoType, DTO> extends BaseTypeORMService<RepoType> {
  entity: string
  repository: Repository<RepoType>
  dto: DTO

  constructor(context: string, entity: string, repository: Repository<RepoType>) {
    super(context, entity, repository)

    this.entity = entity
    this.repository = repository
  }

  /**
   * Updates an existing entity based on the provided ID and DTO.
   *
   * @param id - Entity ID to update.
   * @param updateDto - DTO containing information to update the entity.
   * @returns The updated entity or throws a NotFoundException if the entity is not found.
   */
  async update(id: string, updateDto: DTO): Promise<RepoType> {
    try {
      const entity = await this.findOneBy({ id });

      if (!entity) throw new NotFoundException(`${this.entity} with ID "${id}" not found`);

      for (const property in entity) {
        if (updateDto.hasOwnProperty(property)) {
          entity[property.toString()] = updateDto[property.toString()];
        }
      }

      this.logger.log(`Updating ${this.entity}: ${entity}`)

      return this.repository.save(entity);
    } catch (error) {
      this.logger.error(`Error updating ${this.entity}: ${error.message}`);

      throw error
    }
  }

  /**
   * Removes a entity based on the provided ID.
   *
   * @param id - Entity ID to remove.
   * @returns Promise<void> or throws a NotFoundException if the entity is not found.
   */
  async remove(id: string): Promise<string> {
    try {
      this.logger.log(`Removing ${this.entity} with id: ${id}...`)

      const result = await this.repository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`${this.entity} with ID "${id}" not found`);
      }

      return `${this.entity} with ID "${id}" deleted successfully`
    } catch (error) {
      this.logger.error(`Error removing ${this.entity.toLowerCase()}: ${error.message}`);

      throw error
    }
  }
}