import Parchment from 'parchment';
import Quill from 'quill';
import { createRoot } from 'react-dom/client';
import { Space } from 'antd';
import { FileMarkdownFilled } from '@ant-design/icons';
import { formatSize } from 'App/renderer/utils/file';

import type { VideoBlotValue } from '../utils';

const Embed: typeof Parchment.Embed = Quill.import('blots/embed');

export class VideoBlot extends Embed {
  static blotName = 'ivideo';

  static tagName = 'SPAN';

  static className = 'video-blot';

  static create(value: VideoBlotValue): Node {
    const node = super.create(undefined) as HTMLElement;

    VideoBlot.buildSpan(value, node);

    return node;
  }

  static value(node: HTMLElement): VideoBlotValue {
    const { type, video, size, name } = node.dataset;
    if (type === void 0 || video === void 0 || size === void 0) {
      throw new Error(
        `Failed to make VideoBlot with type: ${type} and video: ${video}`
      );
    }

    return {
      type,
      video,
      name,
      size: parseInt(size),
    };
  }

  static buildSpan(
    { type, video, size, name }: VideoBlotValue,
    node: HTMLElement
  ): void {
    node.dataset.type = type;
    node.dataset.video = video;
    node.dataset.name = name;
    node.dataset.size = `${size}`;

    const videoSpan = document.createElement('div');
    videoSpan.className = 'video-blot-content';

    const root = createRoot(videoSpan);
    root.render(
      <Space size={8} style={{ padding: '6px 12px' }}>
        <Space direction="vertical" size={4}>
          <span className="video-blot-content-name" title={name}>{name}</span>
          <span className="video-blot-content-size">{formatSize(size)}</span>
        </Space>
        <FileMarkdownFilled style={{ fontSize: 40 }} />
      </Space>
    );

    node.appendChild(videoSpan);
  }
}
