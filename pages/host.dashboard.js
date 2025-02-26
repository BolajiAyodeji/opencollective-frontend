import React from 'react';
import PropTypes from 'prop-types';
import { Flex } from '@rebass/grid';
import { omit } from 'lodash';

import { Wallet } from 'styled-icons/boxicons-regular/Wallet';
import { CheckDouble } from 'styled-icons/boxicons-regular/CheckDouble';

import styled, { css } from 'styled-components';

import { addCollectiveCoverData } from '../lib/graphql/queries';
import { withUser } from '../components/UserProvider';
import Loading from '../components/Loading';
import Page from '../components/Page';
import CollectiveCover from '../components/CollectiveCover';
import { FormattedMessage } from 'react-intl';
import MessageBox from '../components/MessageBox';
import Container from '../components/Container';
import Link from '../components/Link';
import { Dashboard, PendingApplications } from '../components/host-dashboard';

const MenuLink = styled(props => <Link {...omit(props, ['isActive'])} />)`
  padding: 4px 20px 0 20px;
  color: #71757a;
  height: 100%;
  display: flex;
  align-items: center;
  border-bottom: 4px solid rgb(0, 0, 0, 0);

  &:focus {
    color: #090a0a;
  }

  &:hover {
    color: #404040;
  }

  svg {
    margin-right: 1em;
  }

  ${props =>
    props.isActive &&
    css`
      color: #090a0a;
      border-bottom: 4px solid #090a0a;
    `}
`;

class HostDashboardPage extends React.Component {
  static getInitialProps({ query: { hostCollectiveSlug, view } }) {
    return { slug: hostCollectiveSlug, ssr: false, view: view || 'finances' };
  }

  static propTypes = {
    slug: PropTypes.string, // for addData
    ssr: PropTypes.bool,
    data: PropTypes.object, // from withData
    loadingLoggedInUser: PropTypes.bool.isRequired, // from withUser
    LoggedInUser: PropTypes.object, // from withUser
    view: PropTypes.oneOf(['finances', 'pending-applications']).isRequired,
  };

  // See https://github.com/opencollective/opencollective/issues/1872
  shouldComponentUpdate(newProps) {
    if (this.props.data.Collective && (!newProps.data || !newProps.data.Collective)) {
      return false;
    } else {
      return true;
    }
  }

  renderView(host) {
    const { view, LoggedInUser, data } = this.props;

    if (!LoggedInUser) {
      return (
        <MessageBox m={5} type="error" withIcon>
          <FormattedMessage id="mustBeLoggedIn" defaultMessage="You must be logged in to see this page" />
        </MessageBox>
      );
    } else if (!data.Collective) {
      return (
        <MessageBox m={5} type="error" withIcon>
          <FormattedMessage id="notFound" defaultMessage="Not found" />
        </MessageBox>
      );
    } else if (!host.isHost) {
      return (
        <MessageBox m={5} type="error" withIcon>
          <FormattedMessage id="page.error.collective.is.not.host" defaultMessage="This page is only for hosts" />
        </MessageBox>
      );
    }

    if (view === 'finances') {
      return <Dashboard hostCollectiveSlug={host.slug} LoggedInUser={LoggedInUser} />;
    } else if (view === 'pending-applications') {
      return <PendingApplications hostCollectiveSlug={host.slug} />;
    }
  }

  render() {
    const { LoggedInUser, loadingLoggedInUser, data, view, slug } = this.props;
    const host = data.Collective || {};

    return (
      <Page
        title={host.name || 'Host Dashboard'}
        description={host.description}
        twitterHandle={host.twitterHandle}
        image={host.image || host.backgroundImage}
        LoggedInUser={LoggedInUser}
      >
        {data.Collective && (
          <CollectiveCover
            collective={host}
            href={`/${host.slug}/dashboard`}
            className="small"
            title={
              <FormattedMessage
                id="host.dashboard.title"
                defaultMessage="{collective} - Host Dashboard"
                values={{ collective: host.name }}
              />
            }
          />
        )}
        {loadingLoggedInUser || data.loading ? (
          <Flex px={2} py={5} justifyContent="center">
            <Loading />
          </Flex>
        ) : (
          <React.Fragment>
            <Container
              position="relative"
              display="flex"
              justifyContent="center"
              alignItems="center"
              background="white"
              borderBottom="#E6E8EB"
              boxShadow="0px 6px 10px 1px #E6E8EB"
              height={60}
            >
              <MenuLink route="host.dashboard" params={{ hostCollectiveSlug: slug }} isActive={view === 'finances'}>
                <Wallet size="1em" />
                Finances
              </MenuLink>
              <MenuLink
                route="host.dashboard"
                params={{ hostCollectiveSlug: slug, view: 'pending-applications' }}
                isActive={view === 'pending-applications'}
              >
                <CheckDouble size="1.2em" />
                Pending applications
              </MenuLink>
            </Container>
            <div>{this.renderView(host)}</div>
          </React.Fragment>
        )}
      </Page>
    );
  }
}

export default withUser(addCollectiveCoverData(HostDashboardPage));
