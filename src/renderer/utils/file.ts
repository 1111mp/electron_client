export function disableDropBehavior() {
  window.addEventListener(
    'dragenter',
    function (evt: DragEvent) {
      if (!(evt.target as HTMLElement).classList.contains('ql-editor')) {
        evt.preventDefault();
        evt.dataTransfer!.effectAllowed = 'none';
        evt.dataTransfer!.dropEffect = 'none';
      }
    },
    false
  );

  window.addEventListener('dragover', function (evt: DragEvent) {
    if (!(evt.target as HTMLElement).classList.contains('ql-editor')) {
      evt.preventDefault();
      evt.dataTransfer!.effectAllowed = 'none';
      evt.dataTransfer!.dropEffect = 'none';
    }
  });

  window.addEventListener('drop', function (evt: DragEvent) {
    if (!(evt.target as HTMLElement).classList.contains('ql-editor')) {
      evt.preventDefault();
      evt.dataTransfer!.effectAllowed = 'none';
      evt.dataTransfer!.dropEffect = 'none';
    }
  });
}

const KB = 1024,
  MB = KB * 1024;

export function formatSize(size: number): string {
  if (size < KB) return `${size} b`;

  if (size < MB) return `${~~(size / KB)} KB`;

  return `${(size / MB).toFixed(2)} MB`;
}

export type FilesInfo =
  | {
      type: string;
      url: string;
      name: string;
      size: number;
    }
  | undefined;

export function getInfoFromFileList(files: FileList): Promise<FilesInfo[]> {
  const promises: Promise<FilesInfo>[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    promises[i] = new Promise((resolve) => {
      var reader = new FileReader();
      reader.onload = (event) => {
        resolve({
          type: file.type!,
          url: event.target!.result as string,
          name: file.name,
          size: file.size,
        });
      };
      reader.readAsDataURL(file);
    });
  }

  return Promise.all(promises);
}
