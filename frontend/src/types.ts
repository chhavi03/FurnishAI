export type Meta = {
  uniq_id: string;
  // ...
  image_url?: string;
  images?: string[] | string; // ⬅️ add this, if your backend returns it
};
