export const imageFactory = (width: number, height: number) => {
  Object.defineProperties(Image.prototype, {
    width: { value: width },
    height: { value: height },
    src: {
      set: (src: string) => {
        console.log('src', src);
      },
    },
  });
  const image = new Image();
  return image;
};

export const mockImage = jest
  .fn()
  .mockReturnValueOnce(imageFactory(1, 1))
  .mockReturnValueOnce(imageFactory(2, 2))
  .mockReturnValueOnce(imageFactory(3, 3));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ImageSource = jest.fn().mockImplementation(() => {
  return {
    ready: true,
    image: mockImage(),
  };
});
