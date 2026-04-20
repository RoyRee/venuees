import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="cols">
          <div>
            <div className="wordline">
              Woven <em>in gold,</em>
              <br />marigold
              <br />& monsoon.
            </div>
            <div style={{ marginTop: 24, fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.7 }}>
              Plot 14, Ramdaspeth
              <br />Nagpur 440010 · Maharashtra
              <br />
              <span style={{ color: "var(--brand)", fontWeight: 500 }}>+91 712 555 0180</span>
              <br />
              hello@venuees.in
            </div>
          </div>
          <div>
            <h6>Venues</h6>
            <ul>
              <li><Link href="/venues?type=hotel">Hotels & ballrooms</Link></li>
              <li><Link href="/venues?type=lawn">Lawns & farmhouses</Link></li>
              <li><Link href="/venues?type=heritage">Heritage havelis</Link></li>
              <li><Link href="/venues?type=resort">Resorts</Link></li>
              <li><Link href="/venues?type=rooftop">Rooftops</Link></li>
            </ul>
          </div>
          <div>
            <h6>Services</h6>
            <ul>
              <li><Link href="/weekend-getaways">Weekend getaways</Link></li>
              <li><Link href="/destination-weddings">Destination weddings</Link></li>
              <li><Link href="/event-management">Event management</Link></li>
              <li><Link href="/event-management/hospitality">Hospitality</Link></li>
              <li><Link href="/event-management/corporate-events">Corporate events</Link></li>
            </ul>
          </div>
          <div>
            <h6>Vendors</h6>
            <ul>
              <li><Link href="/vendors/photographers">Photographers</Link></li>
              <li><Link href="/vendors/decorators">Decorators</Link></li>
              <li><Link href="/vendors/makeup">Makeup artists</Link></li>
              <li><Link href="/vendors/caterers">Caterers</Link></li>
              <li><Link href="/vendors/pandits">Pandits</Link></li>
            </ul>
          </div>
          <div>
            <h6>Company</h6>
            <ul>
              <li><Link href="/about">About us</Link></li>
              <li><Link href="/real-weddings">Real weddings</Link></li>
              <li><Link href="/blog">Journal</Link></li>
              <li><Link href="/list-your-business">List your business</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="fine">
          <span>© 2026 Venuees.in · All rights reserved · Nagpur, Maharashtra</span>
          <span>Privacy · Terms · Sitemap</span>
        </div>
      </div>
    </footer>
  );
}
