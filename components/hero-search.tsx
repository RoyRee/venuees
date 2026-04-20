"use client";

import { useState } from "react";
import Link from "next/link";
import { I } from "@/components/icons";

export function HeroSearch() {
  const [activeTab, setActiveTab] = useState("venues");

  return (
    <div className="hero-search">
      <div className="hero-search-tabs">
        <button className={activeTab === "venues" ? "active" : ""} onClick={() => setActiveTab("venues")}>Venues</button>
        <button className={activeTab === "getaways" ? "active" : ""} onClick={() => setActiveTab("getaways")}>Weekend getaways</button>
        <button className={activeTab === "destinations" ? "active" : ""} onClick={() => setActiveTab("destinations")}>Destination weddings</button>
        <button className={activeTab === "vendors" ? "active" : ""} onClick={() => setActiveTab("vendors")}>Vendors</button>
      </div>
      <div className="hero-search-fields">
        {activeTab === "venues" && (
          <>
            <div className="field">
              <I.Pin width={18} height={18} />
              <div className="field-body">
                <small>Where</small>
                <input defaultValue="Nagpur" />
              </div>
            </div>
            <div className="field">
              <I.Cal width={18} height={18} />
              <div className="field-body">
                <small>When</small>
                <input defaultValue="Dec 2026" placeholder="Pick a month" />
              </div>
            </div>
            <div className="field">
              <I.Users width={18} height={18} />
              <div className="field-body">
                <small>Guests</small>
                <input defaultValue="300" />
              </div>
            </div>
            <Link href="/venues" className="btn btn-primary">
              <I.Search width={16} height={16} /> Search
            </Link>
          </>
        )}
        {activeTab === "getaways" && (
          <>
            <div className="field">
              <I.Pin width={18} height={18} />
              <div className="field-body">
                <small>From</small>
                <input defaultValue="Nagpur" />
              </div>
            </div>
            <div className="field">
              <I.Cal width={18} height={18} />
              <div className="field-body">
                <small>Dates</small>
                <input placeholder="Select dates" />
              </div>
            </div>
            <Link href="/weekend-getaways" className="btn btn-primary">
              <I.Search width={16} height={16} /> Search
            </Link>
          </>
        )}
        {activeTab === "destinations" && (
          <>
            <div className="field">
              <I.Pin width={18} height={18} />
              <div className="field-body">
                <small>Destination</small>
                <input placeholder="e.g. Udaipur, Goa" />
              </div>
            </div>
            <div className="field">
              <I.Users width={18} height={18} />
              <div className="field-body">
                <small>Guests</small>
                <input defaultValue="150" />
              </div>
            </div>
            <Link href="/destination-weddings" className="btn btn-primary">
              <I.Search width={16} height={16} /> Search
            </Link>
          </>
        )}
        {activeTab === "vendors" && (
          <>
            <div className="field">
              <I.Search width={18} height={18} />
              <div className="field-body">
                <small>Service</small>
                <input placeholder="Photographers, Decorators..." />
              </div>
            </div>
            <div className="field">
              <I.Pin width={18} height={18} />
              <div className="field-body">
                <small>Where</small>
                <input defaultValue="Nagpur" />
              </div>
            </div>
            <Link href="/vendors" className="btn btn-primary">
              <I.Search width={16} height={16} /> Search
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
