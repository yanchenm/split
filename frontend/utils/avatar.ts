import * as style from "@dicebear/avatars-identicon-sprites";

import { createAvatar } from "@dicebear/avatars";

export const address_to_avatar = (address: string): string => {
  return createAvatar(style, {
    seed: address,
    radius: 50,
    scale: 60,
  });
}