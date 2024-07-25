"use client";

import 'animate.css';
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState, useRef } from "react";
import { Context } from "./appProvider";
import axios from 'axios';

export default function Home() {
  const { state } = useContext(Context);
  const [jobListings, setJobListings] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    const fetchJobListings = async () => {
      try {
        const response = await axios.get('/api/jobKorea');
        setJobListings(response.data);
      } catch (error) {
        console.error('Error fetching job listings:', error);
      }
    };

    fetchJobListings();
  }, []);

  const scrollLeft = () => {
    if (listRef.current) {
      listRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (listRef.current) {
      listRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative h-screen overflow-hidden">
      <div className="absolute top-[-2rem] w-full -z-10">
        <Image
          src="/images/mainBlack.png"
          layout="responsive"
          width={1920}
          height={1080}
          alt="Main Black Image"
        />
      </div>
      <div className="absolute right-80 top-28">
        <div className="text-white text-5xl font-bold">
          Welcome to <span className="text-customBlue">Daesi</span>
          <hr className="color-white mt-3" />
        </div>
        <div className="text-white text-3xl font-bold pt-9 pl-44">
          {state.username ? (
            <div>안녕하세요, {state.username}님!</div>
          ) : (
            <Link href="/login">Join the site {">>"}</Link>
          )}
        </div>
      </div>
      <div className="absolute right-[20rem] top-[24rem]">
        <div className="text-customBlue text-2xl font-bold text-right animate__animated animate__fadeIn">
          자소서, 면접 모두 Daesi에서
        </div>
        <div className="text-black font-bold pt-2 pl-14 text-right animate__animated animate__fadeIn">
          <div>AI의 맞춤형 피드백과 충분한 연습 기회를 통해</div>
          <div>합격을 향한 준비를 완성하세요.</div>
          <div>쉽고 효과적인 AI 도움으로 성공적인 미래를 만들어보세요.</div>
        </div>
      </div>
      <div className="pl-36 pt-20">
        <Image
          src="/images/mainImg.png"
          alt="메인이미지"
          width={600}
          height={600}
        />
      </div>
      <div className="absolute bottom-0 w-full">
        <Image
          src="/images/mainGray.png"
          width={1920}
          height={1080}
          alt="Main Gray Image"
        />
      </div>

      {/* Job Listings Section */}
      <div className="absolute bottom-10 w-full bg-white p-5 rounded-t-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-5">교육 부문 채용 공고</h2>
        <div className="relative">
          <button 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white rounded-full p-2 z-10 opacity-80 hover:opacity-100 transition-opacity"
            onClick={scrollLeft}
          >
            &lt;
          </button>
          <div className="overflow-hidden px-10">
            <ul ref={listRef} className="flex space-x-4 overflow-x-hidden">
              {jobListings.length > 0 ? (
                jobListings.map((job, index) => (
                  <li key={index} className="min-w-[300px] min-h-[200px] p-4 border rounded-lg hover:shadow-lg flex-shrink-0">
                    <h3 className="text-xl font-bold">{job.title}</h3>
                    <p>Company: {job.company}</p>
                    <p>Location: {job.location}</p>
                    <p>Date Posted: {job.datePosted}</p>
                  </li>
                ))
              ) : (
                <li>Loading job listings...</li>
              )}
            </ul>
          </div>
          <button 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white rounded-full p-2 z-10 opacity-80 hover:opacity-100 transition-opacity"
            onClick={scrollRight}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
