import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: ${props => props.theme.background};
  transition: background-color 0.3s ease;
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Main = styled.main`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  font-family: 'Inter', sans-serif;
`;

const Layout: React.FC = () => {
  return (
    <LayoutContainer>
      <Sidebar />
      <ContentWrapper>
        <TopNav />
        <Main>
          <Outlet />
        </Main>
      </ContentWrapper>
    </LayoutContainer>
  );
};

export default Layout;
