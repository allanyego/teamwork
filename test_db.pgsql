--
-- PostgreSQL database dump
--

-- Dumped from database version 11.5 (Debian 11.5-2+b1)
-- Dumped by pg_dump version 12rc1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: trigger_set_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_set_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$	 BEGIN	     NEW.updated_at = NOW();	     RETURN NEW;	END; 	$$;


ALTER FUNCTION public.trigger_set_timestamp() OWNER TO postgres;

SET default_tablespace = '';

--
-- Name: article_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.article_comments (
    comment character varying(2044) NOT NULL,
    article character varying(2044) NOT NULL
);


ALTER TABLE public.article_comments OWNER TO postgres;

--
-- Name: article_flags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.article_flags (
    article character varying(2044) NOT NULL,
    flag character varying(2044) NOT NULL
);


ALTER TABLE public.article_flags OWNER TO postgres;

--
-- Name: articles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.articles (
    id character varying(2044) NOT NULL,
    category character varying(2044) NOT NULL,
    title character varying(60) NOT NULL,
    text text NOT NULL,
    user_id character varying(2044) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.articles OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id character varying(2044) NOT NULL,
    name character varying(100) NOT NULL,
    user_id character varying(2044) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: comment_flags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comment_flags (
    comment character varying(2044) NOT NULL,
    flag character varying(2044) NOT NULL
);


ALTER TABLE public.comment_flags OWNER TO postgres;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id character varying(2044) NOT NULL,
    comment text NOT NULL,
    user_id character varying(2044) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: flags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flags (
    id character varying(2044) NOT NULL,
    user_id character varying(2044) NOT NULL,
    feedback text NOT NULL,
    status character varying(2044) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.flags OWNER TO postgres;

--
-- Name: gif_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gif_comments (
    gif character varying(2044) NOT NULL,
    comment character varying(2044) NOT NULL
);


ALTER TABLE public.gif_comments OWNER TO postgres;

--
-- Name: gif_flags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gif_flags (
    gif character varying(2044) NOT NULL,
    flag character varying(2044) NOT NULL
);


ALTER TABLE public.gif_flags OWNER TO postgres;

--
-- Name: gifs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gifs (
    id character varying(2044) NOT NULL,
    category character varying(2044) NOT NULL,
    title character varying(60) NOT NULL,
    image character varying(2044) NOT NULL,
    user_id character varying(2044) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.gifs OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying(2044) NOT NULL,
    email character varying(120) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    gender character varying(10) NOT NULL,
    password character varying NOT NULL,
    username character varying(100) NOT NULL,
    phone character varying(10),
    role character varying(100) NOT NULL,
    department character varying(100) NOT NULL,
    address character varying(100),
    type character varying(10) DEFAULT 'user'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: flags flags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flags
    ADD CONSTRAINT flags_pkey PRIMARY KEY (id);


--
-- Name: gifs gis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gifs
    ADD CONSTRAINT gis_pkey PRIMARY KEY (id);


--
-- Name: categories unique_categories_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT unique_categories_name UNIQUE (name);


--
-- Name: users unique_users_enail; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_users_enail UNIQUE (email);


--
-- Name: users unique_users_username; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_users_username UNIQUE (username);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users set_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();


--
-- Name: gifs set_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.gifs FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();


--
-- Name: flags set_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.flags FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();


--
-- Name: comments set_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();


--
-- Name: categories set_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();


--
-- Name: articles set_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();


--
-- Name: articles article_category; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT article_category FOREIGN KEY (category) REFERENCES public.categories(id) MATCH FULL ON DELETE CASCADE;


--
-- Name: article_comments article_comments_article; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_comments
    ADD CONSTRAINT article_comments_article FOREIGN KEY (article) REFERENCES public.articles(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: article_comments article_comments_comment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_comments
    ADD CONSTRAINT article_comments_comment FOREIGN KEY (comment) REFERENCES public.comments(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: article_flags article_flags_article; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_flags
    ADD CONSTRAINT article_flags_article FOREIGN KEY (article) REFERENCES public.articles(id) MATCH FULL ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: article_flags article_flags_flag; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_flags
    ADD CONSTRAINT article_flags_flag FOREIGN KEY (flag) REFERENCES public.flags(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: articles article_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT article_user FOREIGN KEY (user_id) REFERENCES public.users(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: categories category_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT category_user FOREIGN KEY (user_id) REFERENCES public.users(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comment_flags comment_flags_comment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment_flags
    ADD CONSTRAINT comment_flags_comment FOREIGN KEY (comment) REFERENCES public.comments(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comment_flags comment_flags_flag; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment_flags
    ADD CONSTRAINT comment_flags_flag FOREIGN KEY (flag) REFERENCES public.flags(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comment_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comment_user FOREIGN KEY (user_id) REFERENCES public.users(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: flags flag_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flags
    ADD CONSTRAINT flag_user FOREIGN KEY (user_id) REFERENCES public.users(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: gifs gif_category; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gifs
    ADD CONSTRAINT gif_category FOREIGN KEY (category) REFERENCES public.categories(id) MATCH FULL ON DELETE CASCADE;


--
-- Name: gif_comments gif_comments_comment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gif_comments
    ADD CONSTRAINT gif_comments_comment FOREIGN KEY (comment) REFERENCES public.comments(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: gif_comments gif_comments_gif; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gif_comments
    ADD CONSTRAINT gif_comments_gif FOREIGN KEY (gif) REFERENCES public.gifs(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: gif_flags gif_flags_flag; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gif_flags
    ADD CONSTRAINT gif_flags_flag FOREIGN KEY (flag) REFERENCES public.flags(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: gif_flags gif_flags_gif; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gif_flags
    ADD CONSTRAINT gif_flags_gif FOREIGN KEY (gif) REFERENCES public.gifs(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

