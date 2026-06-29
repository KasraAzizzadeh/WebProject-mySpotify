import { getAlbums, getSongs } from "@/store/mockDb";
import { AlbumItem, SongItem } from "@/types";
import { error } from "console";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAlbumById = async (albumId: string) : Promise<AlbumItem> => {
    await delay(100);

    const allAlbums = getAlbums();
    const album = allAlbums.find(al => al.id === albumId);
    if (!album)
        throw new Error("Sorry no such album exists");
    return album;
}

export const getSongById = async (songId: string) : Promise<SongItem> => {
    await delay(100);

    const allSongs = getSongs();
    const song = allSongs.find(s => s.id === songId);
    if (!song)
        throw new Error("This song doesn't exist");
    return song;
}

export const getSongsByAlbumId = async (albumId: string): Promise<SongItem[]> => {
  await delay(100);

  const album = await getAlbumById(albumId);

  const songs = await Promise.all(
    album.songList.map((songId) => getSongById(songId))
  );

  return songs.filter((song): song is SongItem => song != null);
};