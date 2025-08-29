import { StateStorage, createJSONStorage } from "zustand/middleware";
import Cookies from 'js-cookie';

const storageApi: StateStorage = {

  getItem: function (name: string): string | Promise<string | null> | null {

    const data = Cookies.get(name);

    return data || null;
  },

  setItem: function (name: string, value: string): void {
    Cookies.set(name, value, { expires: 1, secure: true })
  },

  removeItem: function (name: string): void | Promise<void> {
    Cookies.remove(name);
    console.log('Removiendo cookie', name)
  }
}

export const customCookieStorage = createJSONStorage(() => storageApi)