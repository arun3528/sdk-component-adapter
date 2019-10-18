import {Observable} from 'rxjs';
import {RoomsAdapter} from '@webex/components';

export const ROOM_UPDATED_EVENT = 'updated';

/**
 * The `RoomsSDKAdapter` is an implementation of the `RoomsAdapter` interface.
 * This adapter utilizes the Webex JS SDK to fetch data about a room.
 *
 * @export
 * @class RoomsSDKAdapter
 * @extends {RoomsAdapter}
 */
export default class RoomsSDKAdapter extends RoomsAdapter {
  /**
   * Fetches the room data from the sdk and returns in the shape required by adapter.
   *
   * @param {string} ID
   * @returns {Room}
   * @memberof RoomsSDKAdapter
   */
  async fetchRoom(ID) {
    const {id, title, type} = await this.datasource.rooms.get(ID);

    return {
      ID: id,
      title,
      type,
    };
  }

  /**
   * Returns an observable that emits room data of the given ID.
   *
   * @param {string} ID ID of room to get
   * @returns {Observable.<Room>}
   * @memberof RoomsSDKAdapter
   */
  getRoom(ID) {
    return Observable.create((observer) => {
      // Start listening for room changes
      this.datasource.rooms.listen();
      this.datasource.rooms.on(ROOM_UPDATED_EVENT, () => {
        // Room has updates, fetch and send
        this.fetchRoom(ID)
          .then((room) => observer.next(room))
          .catch((error) => observer.error(error));
      });

      // Get our initial room from the SDK
      this.fetchRoom(ID)
        .then((room) => observer.next(room))
        .catch((error) => observer.error(error));

      return () => {
        // Cleanup when unsubscribing
        this.datasource.rooms.stopListening();
        this.datasource.rooms.off(ROOM_UPDATED_EVENT);
      };
    });
  }
}