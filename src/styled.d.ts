import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    primary: string;
    border: string;
    sidebarBg: string;
    sidebarText: string;
    sidebarActive: string;
    topNavBg: string;
  }
}
