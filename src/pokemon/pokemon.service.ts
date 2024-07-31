import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { isValidObjectId, Model } from 'mongoose';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private defaulLimit: number;
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    this.defaulLimit = configService.getOrThrow<number>(
      'defaultLimitPagination',
    );
  }

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      createPokemonDto.name = createPokemonDto.name.toLowerCase();
      const pokemon = await this.pokemonModel.create({ ...createPokemonDto });
      return pokemon;
    } catch (error) {
      this.handleExceptions({ error });
    }
  }

  findAll(queryParams: PaginationDto) {
    const { limit = this.defaulLimit, offset } = queryParams;
    return this.pokemonModel.find().limit(limit).skip(offset).sort({
      no: 1,
    });
  }

  async findOne(termino: string) {
    let pokemon: Pokemon;
    const isNumber: boolean = !isNaN(+termino);
    const isValidMongoId: boolean = isValidObjectId(termino);

    if (isNumber) pokemon = await this.pokemonModel.findOne({ no: termino });

    if (isValidMongoId && !isNumber)
      pokemon = await this.pokemonModel.findById(termino);

    if (!isNumber && !isValidMongoId)
      pokemon = await this.pokemonModel.findOne({
        name: termino.toLowerCase().trim(),
      });

    if (!pokemon)
      throw new NotFoundException(
        `Pokemon con id, nombre, o numero "${termino}" no encontrado`,
      );

    return pokemon;
  }

  async update(termino: string, updatePokemonDto: UpdatePokemonDto) {
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase().trim();

    const pokemon = await this.findOne(termino);
    try {
      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions({ error });
    }
  }

  async remove(id: string) {
    const result = await this.pokemonModel.findByIdAndDelete(id);
    if (!result)
      throw new BadRequestException(`no se encontro pokemon con id ${id}`);
    return result;
  }

  private handleExceptions({ error }) {
    if (error.code === 11000)
      throw new BadRequestException(
        `El pokemon ya existe en la base de datos ${JSON.stringify(error.keyValue)}`,
      );
    console.log({ error });
    throw new InternalServerErrorException(
      'No se pudo procesar este pokemon, checkea los server logs',
    );
  }
}
