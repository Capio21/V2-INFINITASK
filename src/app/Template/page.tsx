"use client";

import Script from "next/script";
import "@/app/dist/css/main.css?v=1628755089081";
// import "@/app/dist/js/main.min.js?v=1628755089081";
// import "@/app/dist/js/chart.sample.min.js";


  

export default function TaskDrawer() {


  return (
    <>
    
    <Script
        src="@/dist/js/main.min.js?v=1628755089081"
        strategy="beforeInteractive" // Choose strategy: 'afterInteractive', 'afterInteractive', or 'lazyOnload'
    />
    <Script
        src="@/dist/js/chart.sample.min.js"
        strategy="beforeInteractive" // Choose strategy: 'afterInteractive', 'afterInteractive', or 'lazyOnload'
    />
    <div id="app">

    <nav id="navbar-main" className="navbar is-fixed-top">
  <div className="navbar-brand">
    <a className="navbar-item mobile-aside-button">
      <span className="icon"><i className="mdi mdi-forwardburger mdi-24px"></i></span>
    </a>
    <div className="navbar-item">
      <div className="control"><input placeholder="Search everywhere..." className="input" /></div>
    </div>
  </div>
  <div className="navbar-brand is-right">
    <a className="navbar-item --jb-navbar-menu-toggle" data-target="navbar-menu">
      <span className="icon"><i className="mdi mdi-dots-vertical mdi-24px"></i></span>
    </a>
  </div>
  <div className="navbar-menu" id="navbar-menu">
    <div className="navbar-end">
      <div className="navbar-item dropdown has-divider">
        <a className="navbar-link">
          <span className="icon"><i className="mdi mdi-menu"></i></span>
          <span>Sample Menu</span>
          <span className="icon">
            <i className="mdi mdi-chevron-down"></i>
          </span>
        </a>
        <div className="navbar-dropdown">
          <a href="profile.html" className="navbar-item">
            <span className="icon"><i className="mdi mdi-account"></i></span>
            <span>My Profile</span>
          </a>
          <a className="navbar-item">
            <span className="icon"><i className="mdi mdi-settings"></i></span>
            <span>Settings</span>
          </a>
          <a className="navbar-item">
            <span className="icon"><i className="mdi mdi-email"></i></span>
            <span>Messages</span>
          </a>
          <hr className="navbar-divider" />
          <a className="navbar-item">
            <span className="icon"><i className="mdi mdi-logout"></i></span>
            <span>Log Out</span>
          </a>
        </div>
      </div>
      <div className="navbar-item dropdown has-divider has-user-avatar">
        <a className="navbar-link">
          <div className="user-avatar">
            <img src="https://avatars.dicebear.com/v2/initials/john-doe.svg" alt="John Doe" className="rounded-full" />
          </div>
          <div className="is-user-name"><span>John Doe</span></div>
          <span className="icon"><i className="mdi mdi-chevron-down"></i></span>
        </a>
        <div className="navbar-dropdown">
          <a href="profile.html" className="navbar-item">
            <span className="icon"><i className="mdi mdi-account"></i></span>
            <span>My Profile</span>
          </a>
          <a className="navbar-item">
            <span className="icon"><i className="mdi mdi-settings"></i></span>
            <span>Settings</span>
          </a>
          <a className="navbar-item">
            <span className="icon"><i className="mdi mdi-email"></i></span>
            <span>Messages</span>
          </a>
          <hr className="navbar-divider" />
          <a className="navbar-item">
            <span className="icon"><i className="mdi mdi-logout"></i></span>
            <span>Log Out</span>
          </a>
        </div>
      </div>
      <a href="https://justboil.me/tailwind-admin-templates" className="navbar-item has-divider desktop-icon-only">
        <span className="icon"><i className="mdi mdi-help-circle-outline"></i></span>
        <span>About</span>
      </a>
      <a href="https://github.com/justboil/admin-one-tailwind" className="navbar-item has-divider desktop-icon-only">
        <span className="icon"><i className="mdi mdi-github-circle"></i></span>
        <span>GitHub</span>
      </a>
      <a title="Log out" className="navbar-item desktop-icon-only">
        <span className="icon"><i className="mdi mdi-logout"></i></span>
        <span>Log out</span>
      </a>
    </div>
  </div>
</nav>

    <aside className="aside is-placed-left is-expanded">
    <div className="aside-tools">
        <div>
        Admin <b className="font-black">One</b>
        </div>
    </div>
    <div className="menu is-menu-main">
        <p className="menu-label">General</p>
        <ul className="menu-list">
        <li className="active">
            <a href="index.html">
            <span className="icon"><i className="mdi mdi-desktop-mac"></i></span>
            <span className="menu-item-label">Dashboard</span>
            </a>
        </li>
        </ul>
        <p className="menu-label">Examples</p>
        <ul className="menu-list">
        <li className="--set-active-tables-html">
            <a href="tables.html">
            <span className="icon"><i className="mdi mdi-table"></i></span>
            <span className="menu-item-label">Tables</span>
            </a>
        </li>
        <li className="--set-active-forms-html">
            <a href="forms.html">
            <span className="icon"><i className="mdi mdi-square-edit-outline"></i></span>
            <span className="menu-item-label">Forms</span>
            </a>
        </li>
        <li className="--set-active-profile-html">
            <a href="profile.html">
            <span className="icon"><i className="mdi mdi-account-circle"></i></span>
            <span className="menu-item-label">Profile</span>
            </a>
        </li>
        <li>
            <a href="login.html">
            <span className="icon"><i className="mdi mdi-lock"></i></span>
            <span className="menu-item-label">Login</span>
            </a>
        </li>
        <li>
            <a className="dropdown">
            <span className="icon"><i className="mdi mdi-view-list"></i></span>
            <span className="menu-item-label">Submenus</span>
            <span className="icon"><i className="mdi mdi-plus"></i></span>
            </a>
            <ul>
            <li>
                <a href="#void">
                <span>Sub-item One</span>
                </a>
            </li>
            <li>
                <a href="#void">
                <span>Sub-item Two</span>
                </a>
            </li>
            </ul>
        </li>
        </ul>
        <p className="menu-label">About</p>
        <ul className="menu-list">
        <li>
            <a href="https://justboil.me" onClick={() => {alert('Coming soon'); return false}} target="_blank" className="has-icon">
            <span className="icon"><i className="mdi mdi-credit-card-outline"></i></span>
            <span className="menu-item-label">Premium Demo</span>
            </a>
        </li>
        <li>
            <a href="https://justboil.me/tailwind-admin-templates" className="has-icon">
            <span className="icon"><i className="mdi mdi-help-circle"></i></span>
            <span className="menu-item-label">About</span>
            </a>
        </li>
        <li>
            <a href="https://github.com/justboil/admin-one-tailwind" className="has-icon">
            <span className="icon"><i className="mdi mdi-github-circle"></i></span>
            <span className="menu-item-label">GitHub</span>
            </a>
        </li>
        </ul>
    </div>
    </aside>

    <section className="is-title-bar">
    <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
        <ul>
        <li>Admin</li>
        <li>Dashboard</li>
        </ul>
        <a href="https://justboil.me/" onClick={() => {alert('Coming soon'); return false}} target="_blank" className="button blue">
        <span className="icon"><i className="mdi mdi-credit-card-outline"></i></span>
        <span>Premium Demo</span>
        </a>
    </div>
    </section>

    <section className="is-hero-bar">
    <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
        <h1 className="title">
        Dashboard
        </h1>
        <button className="button light">Button</button>
    </div>
    </section>

    <section className="section main-section">
      

        <div className="notification blue">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
            <div>
            <span className="icon"><i className="mdi mdi-buffer"></i></span>
            <b>Responsive table</b>
            </div>
            <button type="button" className="button small textual --jb-notification-dismiss">Dismiss</button>
        </div>
        </div>

     
    </section>


    </div>
    </>
  );
}