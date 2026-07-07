/**
 * context/UiActions.tsx
 * Cung cấp các hành động UI dùng chung (mở modal Tải/Đăng ký/Tư vấn) cho toàn bộ
 * cây component mà không cần truyền prop lồng nhau. Modal do MainLayout sở hữu.
 */
import { createContext, useContext } from 'react';

export type ModalTab = 'download' | 'login' | 'register' | 'consult';

export interface UiActions {
  /** Mở modal tải phần mềm (mặc định sản phẩm Dự toán BNSC). */
  openDownload: (productId?: string) => void;
  /** Mở modal đăng ký mua bản quyền. */
  openRegister: () => void;
  /** Mở modal đăng ký tư vấn / chiêu sinh. */
  openConsult: (courseId?: string) => void;
}

const noop = () => {};

export const UiActionsContext = createContext<UiActions>({
  openDownload: noop,
  openRegister: noop,
  openConsult: noop,
});

export const useUiActions = (): UiActions => useContext(UiActionsContext);
