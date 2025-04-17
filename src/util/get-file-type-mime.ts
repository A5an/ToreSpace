export function getFileType(mimeType): string {
  // Словарь для определения типа файла
  const mimeTypes = {
    image: "picture",
    audio: "audio",
    video: "video",
    "application/pdf": "document",
    "application/msword": "document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "document",
    "application/vnd.ms-excel": "document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "document",
    "application/vnd.ms-powerpoint": "document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "document",
    "text/plain": "document",
    "text/html": "document",
    "text/csv": "document",
    // можно добавить другие MIME-типы по необходимости
  };

  // Определение типа файла по MIME-типу
  for (let key in mimeTypes) {
    if (mimeTypes.hasOwnProperty(key) && mimeType.startsWith(key)) {
      return mimeTypes[key];
    }
  }
  return "document"; // возвращаем 'document', если MIME-тип не найден
}
