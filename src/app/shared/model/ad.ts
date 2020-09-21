import { AdStatus } from './types/ad-status';
import { PetStatus } from './types/pet-status';
import { LatLng } from './lat-lng';
import { Pet } from './pet';
import { User } from './user';

export class Ad {
    id: number;
    code: string;
    date: number;
    adStatus: AdStatus;
    petStatus: PetStatus;
    reward: number;
    lastSpottedCoords: LatLng;
    pet: Pet;
    observations: string;
    photo: string;
    user: User;
}
