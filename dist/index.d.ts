import { Message } from 'discord.js';
import { Config } from './config';
import { GroupCache } from './groupCache';
export declare function create(message: Message, config: Config): Promise<GroupCache>;
export declare function remove(message: Message, config: Config): Promise<GroupCache>;
export declare function join(message: Message, config: Config): Promise<GroupCache>;
export declare function leave(message: Message, config: Config): Promise<GroupCache>;
export declare function list(message: Message, config: Config): Promise<string>;
