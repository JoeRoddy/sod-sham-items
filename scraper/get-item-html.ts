import axios from 'axios';

export default async (itemId: string) => {
  const { data } = await axios.get(
    `https://www.wowhead.com/classic/item=${itemId}`,
  );
  return data;
};
