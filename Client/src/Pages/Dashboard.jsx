import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ArrowUp,
  LogOut,
  User,
  Sparkles,
  Trash2,
  Pencil,
  Plus,
  X,
  Search,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import API from "../services/api";


function Dashboard() {

  const navigate = useNavigate();


  // =====================================================
  // USER
  // =====================================================

  const [userName, setUserName] =
    useState("User");


  // =====================================================
  // NOTES
  // =====================================================

  const [notes, setNotes] =
    useState([]);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalNotes, setTotalNotes] =
    useState(0);

  const limit = 6;


  // =====================================================
  // CREATE NOTE
  // =====================================================

  const [formData, setFormData] =
    useState({
      title: "",
      description: "",
    });

  const [isSubmitting, setIsSubmitting] =
    useState(false);


  // =====================================================
  // EDIT NOTE
  // =====================================================

  const [selectedNote, setSelectedNote] =
    useState(null);

  const [isUpdating, setIsUpdating] =
    useState(false);


  // =====================================================
  // AI CHAT
  // =====================================================

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(false);


  // =====================================================
  // GET TOKEN
  // =====================================================

  const getToken = () =>
    localStorage.getItem("token");


  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {

    const storedUser =
      localStorage.getItem("user");


    if (!storedUser) return;


    try {

      const user =
        JSON.parse(storedUser);


      if (user?.name) {
        setUserName(user.name);
      }

    } catch (error) {

      console.error(
        "Could not parse user:",
        error
      );
    }

  }, []);


  // =====================================================
  // FETCH NOTES
  // =====================================================

  const fetchNotes =
    useCallback(
      async (
        page = 1,
        search = ""
      ) => {

        try {

          const token =
            getToken();


          const response =
            await API.get(
              `/notes?page=${page}&limit=${limit}&search=${encodeURIComponent(
                search
              )}`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          const data =
            response.data || {};


          const fetchedNotes =
            Array.isArray(data.notes)
              ? data.notes
              : Array.isArray(data)
                ? data
                : [];


          setNotes(
            fetchedNotes
          );


          setCurrentPage(
            Number(
              data.currentPage || page
            )
          );


          setTotalPages(
            Number(
              data.totalPages || 1
            )
          );


          setTotalNotes(
            Number(
              data.totalNotes ??
              fetchedNotes.length
            )
          );

        } catch (error) {

          console.error(
            "ERROR FETCHING NOTES:",
            error.response?.data ||
              error.message
          );

          setNotes([]);
          setTotalPages(1);
          setTotalNotes(0);
        }

      },
      []
    );


  // =====================================================
  // INITIAL / SEARCH / PAGE LOAD
  // =====================================================

  useEffect(() => {

    fetchNotes(
      currentPage,
      searchQuery
    );

  }, [
    currentPage,
    searchQuery,
    fetchNotes,
  ]);


  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearchChange =
    (event) => {

      setSearchQuery(
        event.target.value
      );

      setCurrentPage(1);
    };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/login");
  };


  // =====================================================
  // DELETE ACCOUNT
  // =====================================================

  const handleDeleteAccount =
    async () => {

      const confirmed =
        window.confirm(
          "Are you sure you want to permanently delete your account?"
        );


      if (!confirmed) return;


      try {

        const token =
          getToken();


        await API.delete(
          "/users/delete-account",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );


        navigate("/register");

      } catch (error) {

        console.error(
          "DELETE ACCOUNT ERROR:",
          error.response?.data ||
            error.message
        );


        alert(
          "Unable to delete your account."
        );
      }
    };


  // =====================================================
  // CREATE NOTE
  // =====================================================

  const handleCreateNote =
    async (event) => {

      event.preventDefault();


      const title =
        formData.title.trim();

      const description =
        formData.description.trim();


      if (!title || !description) {

        alert(
          "Please enter both title and description."
        );

        return;
      }


      setIsSubmitting(true);


      try {

        const token =
          getToken();


        await API.post(
          "/notes",
          {
            title,
            description,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        setFormData({
          title: "",
          description: "",
        });


        setSearchQuery("");


        setCurrentPage(1);


        await fetchNotes(
          1,
          ""
        );


      } catch (error) {

        console.error(
          "CREATE NOTE ERROR:",
          error.response?.data ||
            error.message
        );


        alert(
          error.response?.data?.message ||
          "Could not create note."
        );

      } finally {

        setIsSubmitting(false);
      }
    };


  // =====================================================
  // EDIT INPUT
  // =====================================================

  const handleModalChange =
    (event) => {

      setSelectedNote(
        (previous) => ({
          ...previous,

          [event.target.name]:
            event.target.value,
        })
      );
    };


  // =====================================================
  // UPDATE NOTE
  // =====================================================

  const handleUpdateNote =
    async (event) => {

      event.preventDefault();


      if (!selectedNote) {
        return;
      }


      const title =
        selectedNote.title?.trim();

      const description =
        selectedNote.description?.trim();


      if (!title || !description) {

        alert(
          "Title and description are required."
        );

        return;
      }


      setIsUpdating(true);


      try {

        const token =
          getToken();


        await API.put(
          `/notes/${selectedNote._id}`,
          {
            title,
            description,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        setSelectedNote(null);


        await fetchNotes(
          currentPage,
          searchQuery
        );


      } catch (error) {

        console.error(
          "UPDATE NOTE ERROR:",
          error.response?.data ||
            error.message
        );


        alert(
          error.response?.data?.message ||
          "Could not update note."
        );

      } finally {

        setIsUpdating(false);
      }
    };


  // =====================================================
  // DELETE NOTE
  // =====================================================

  const handleDeleteNote =
    async (noteId) => {

      if (!noteId) return;


      const confirmed =
        window.confirm(
          "Are you sure you want to delete this note?"
        );


      if (!confirmed) return;


      try {

        const token =
          getToken();


        await API.delete(
          `/notes/${noteId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        setSelectedNote(null);


        // ---------------------------------------------
        // REFETCH CURRENT PAGE
        // ---------------------------------------------

        const remainingNotes =
          notes.length - 1;


        if (
          remainingNotes <= 0 &&
          currentPage > 1
        ) {

          const previousPage =
            currentPage - 1;


          setCurrentPage(
            previousPage
          );


          await fetchNotes(
            previousPage,
            searchQuery
          );

        } else {

          await fetchNotes(
            currentPage,
            searchQuery
          );
        }


      } catch (error) {

        console.error(
          "DELETE NOTE ERROR:",
          error.response?.data ||
            error.message
        );


        alert(
          error.response?.data?.message ||
          "Could not delete note."
        );
      }
    };


  // =====================================================
  // SEND AI MESSAGE
  // =====================================================

  const sendMessage =
    async () => {

      const trimmedMessage =
        message.trim();


      if (
        !trimmedMessage ||
        isLoading
      ) {
        return;
      }


      const userMessage = {

        id:
          `${Date.now()}-user`,

        role:
          "user",

        content:
          trimmedMessage,
      };


      setMessages(
        (previous) => [
          ...previous,
          userMessage,
        ]
      );


      setMessage("");

      setIsLoading(true);


      try {

        const response =
          await API.post(
            "/agent/chat",
            {
              message:
                trimmedMessage,
            },
            {
              headers: {
                Authorization:
                  `Bearer ${getToken()}`,
              },
            }
          );


        const answer =
          response.data?.answer ||
          response.data?.message ||
          "Done.";


        const agentMessage = {

          id:
            `${Date.now()}-agent`,

          role:
            "agent",

          content:
            answer,
        };


        setMessages(
          (previous) => [
            ...previous,
            agentMessage,
          ]
        );


        // =================================================
        // CRITICAL:
        // REFRESH DASHBOARD NOTES AFTER EVERY SUCCESSFUL
        // AI OPERATION.
        //
        // This makes newly created notes appear immediately
        // and makes updated/deleted notes disappear/update.
        // =================================================

        await fetchNotes(
          currentPage,
          searchQuery
        );


      } catch (error) {

        console.error(
          "AGENT ERROR:",
          error.response?.data ||
            error.message
        );


        const errorMessage = {

          id:
            `${Date.now()}-error`,

          role:
            "agent",

          content:
            error.response?.data?.message ||
            "Something went wrong while processing your request.",
        };


        setMessages(
          (previous) => [
            ...previous,
            errorMessage,
          ]
        );

      } finally {

        setIsLoading(false);
      }
    };


  // =====================================================
  // SUBMIT AI FORM
  // =====================================================

  const handleSubmit =
    (event) => {

      event.preventDefault();

      sendMessage();
    };


  // =====================================================
  // AI KEYBOARD
  // =====================================================

  const handleKeyDown =
    (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        sendMessage();
      }
    };


  // =====================================================
  // CLEAR AI CHAT
  // =====================================================

  const clearConversation =
    () => {

      setMessages([]);
    };


  // =====================================================
  // SAFE NOTES
  // =====================================================

  const safeNotes =
    Array.isArray(notes)
      ? notes
      : [];


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="min-h-screen bg-[#060608] text-white">


      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute left-1/2 top-[-250px] h-[600px] w-[700px] -translate-x-1/2 rounded-full bg-orange-600/[0.08] blur-[150px]" />

        <div className="absolute bottom-[-200px] left-[-150px] h-[500px] w-[500px] rounded-full bg-orange-600/[0.05] blur-[140px]" />

      </div>


      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="sticky top-0 z-40 border-b border-zinc-800/70 bg-[#060608]/90 backdrop-blur-xl">

        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">


          {/* BRAND */}

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="flex items-center gap-3"
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 font-black text-orange-400">
              R
            </div>

            <span className="text-lg font-bold">
              Agent{" "}
              <span className="text-orange-500">
                RSP
              </span>
            </span>

          </button>


          {/* SEARCH */}

          <div className="relative hidden w-full max-w-md md:block">

            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={
                handleSearchChange
              }
              placeholder="Search your notes..."
              className="w-full rounded-full border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-9 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-500/50"
            />

            {searchQuery && (

              <button
                onClick={() =>
                  setSearchQuery("")
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X size={15} />
              </button>

            )}

          </div>


          {/* USER */}

          <div className="flex items-center gap-2">

            <div className="hidden items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1.5 sm:flex">

              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/10">
                <User
                  size={13}
                  className="text-orange-400"
                />
              </div>

              <span className="max-w-[120px] truncate text-sm text-zinc-300">
                {userName}
              </span>

            </div>


            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 hover:text-white"
            >

              <LogOut size={15} />

              <span className="hidden sm:inline">
                Logout
              </span>

            </button>


            <button
              onClick={
                handleDeleteAccount
              }
              className="hidden rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500 hover:text-white sm:block"
            >
              Delete Account
            </button>

          </div>

        </div>


        {/* MOBILE SEARCH */}

        <div className="px-5 pb-3 md:hidden">

          <div className="relative">

            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={
                handleSearchChange
              }
              placeholder="Search notes..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 pl-9 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-500/50"
            />

          </div>

        </div>

      </nav>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8">


        {/* =================================================
            AI SECTION
        ================================================= */}

        <section className="mx-auto mb-14 max-w-4xl">

          <div className="mb-6 text-center">

            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">

              <Sparkles
                size={24}
                className="text-orange-400"
              />

            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-500">
              Personal AI Agent
            </p>

            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
              What do you want{" "}
              <span className="text-orange-500">
                Agent RSP
              </span>{" "}
              to do?
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-500">
              Create, search, update and delete your
              notes using natural language.
            </p>

          </div>


          {/* CHAT */}

          {messages.length > 0 && (

            <div className="mb-5 max-h-[420px] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">

              <div className="space-y-6">

                {messages.map(
                  (item) => (

                    <div
                      key={item.id}
                      className={
                        item.role === "user"
                          ? "flex justify-end"
                          : "flex justify-start"
                      }
                    >

                      {item.role === "user" ? (

                        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-orange-500/[0.10] px-4 py-3">

                          <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-200">
                            {item.content}
                          </p>

                        </div>

                      ) : (

                        <div className="flex max-w-[90%] gap-3">

                          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10">

                            <Sparkles
                              size={14}
                              className="text-orange-400"
                            />

                          </div>

                          <div>

                            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-orange-500">
                              Agent RSP
                            </p>

                            <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                              {item.content}
                            </p>

                          </div>

                        </div>

                      )}

                    </div>

                  )
                )}


                {isLoading && (

                  <div className="flex gap-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10">

                      <Sparkles
                        size={14}
                        className="animate-pulse text-orange-400"
                      />

                    </div>

                    <div className="flex items-center gap-1">

                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500" />

                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500"
                        style={{
                          animationDelay:
                            "150ms",
                        }}
                      />

                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500"
                        style={{
                          animationDelay:
                            "300ms",
                        }}
                      />

                    </div>

                  </div>

                )}

              </div>

            </div>

          )}


          {/* AI INPUT */}

          <form
            onSubmit={handleSubmit}
          >

            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/90 p-2 shadow-2xl backdrop-blur-xl focus-within:border-orange-500/40">

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                rows={3}
                disabled={isLoading}
                placeholder="Tell Agent RSP what you want done..."
                className="w-full resize-none bg-transparent px-4 pb-10 pt-3 text-sm leading-7 text-white outline-none placeholder:text-zinc-600 disabled:opacity-50"
              />

              <span className="absolute bottom-3 left-4 text-[10px] text-zinc-600">
                Enter to send · Shift + Enter for new line
              </span>


              <button
                type="submit"
                disabled={
                  !message.trim() ||
                  isLoading
                }
                className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600"
              >

                <ArrowUp size={18} />

              </button>

            </div>

          </form>


          {messages.length > 0 && (

            <div className="mt-3 flex justify-end">

              <button
                onClick={
                  clearConversation
                }
                className="text-xs text-zinc-600 hover:text-zinc-400"
              >
                Clear conversation
              </button>

            </div>

          )}

        </section>


        {/* =================================================
            CREATE NOTE
        ================================================= */}

        <section className="mx-auto mb-14 max-w-3xl">

          <div className="mb-4 flex items-center gap-2">

            <Plus
              size={18}
              className="text-orange-400"
            />

            <h2 className="text-lg font-semibold">
              Create Note Manually
            </h2>

          </div>


          <form
            onSubmit={
              handleCreateNote
            }
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
          >

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={(event) =>
                setFormData(
                  (previous) => ({
                    ...previous,
                    title:
                      event.target.value,
                  })
                )
              }
              placeholder="Note title"
              className="w-full bg-transparent text-xl font-semibold text-white outline-none placeholder:text-zinc-600"
            />

            <div className="my-4 h-px bg-zinc-800" />

            <textarea
              name="description"
              value={
                formData.description
              }
              onChange={(event) =>
                setFormData(
                  (previous) => ({
                    ...previous,
                    description:
                      event.target.value,
                  })
                )
              }
              rows={4}
              placeholder="Write your note..."
              className="w-full resize-none bg-transparent text-sm leading-7 text-zinc-300 outline-none placeholder:text-zinc-600"
            />


            <div className="mt-5 flex justify-end">

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? "Creating..."
                  : "Create Note"}
              </button>

            </div>

          </form>

        </section>


        {/* =================================================
            NOTES HEADER
        ================================================= */}

        <section>

          <div className="mb-5 flex items-center justify-between gap-4">

            <div>

              <h2 className="text-xl font-bold">
                {searchQuery
                  ? `Search Results`
                  : "Your Notes"}
              </h2>

              <p className="mt-1 text-xs text-zinc-600">

                {searchQuery
                  ? `"${searchQuery}"`
                  : `${totalNotes} ${
                      totalNotes === 1
                        ? "note"
                        : "notes"
                    }`}

              </p>

            </div>

            <div className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-500">
              Total: {totalNotes}
            </div>

          </div>


          {/* =================================================
              NOTES GRID
          ================================================= */}

          {safeNotes.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 py-16 text-center">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">

                <Sparkles
                  size={20}
                  className="text-orange-500"
                />

              </div>

              <h3 className="font-semibold text-zinc-300">
                {searchQuery
                  ? "No matching notes"
                  : "No notes yet"}
              </h3>

              <p className="mt-2 text-sm text-zinc-600">
                {searchQuery
                  ? "Try another search."
                  : "Create your first note above or ask Agent RSP to create one."}
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {safeNotes.map(
                (note) => (

                  <div
                    key={note._id}
                    className="group relative flex min-h-[220px] flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:-translate-y-1 hover:border-orange-500/40 hover:bg-zinc-900"
                  >

                    <div>

                      <div className="flex items-start justify-between gap-3">

                        <h3 className="line-clamp-2 text-lg font-bold text-white group-hover:text-orange-400">
                          {note.title}
                        </h3>


                        <button
                          onClick={() =>
                            handleDeleteNote(
                              note._id
                            )
                          }
                          className="shrink-0 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 opacity-70 hover:bg-red-500 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
                          title="Delete note"
                        >

                          <Trash2
                            size={15}
                          />

                        </button>

                      </div>


                      <p className="mt-3 line-clamp-6 whitespace-pre-line text-sm leading-6 text-zinc-400">
                        {note.description}
                      </p>

                    </div>


                    <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-3">

                      <span className="text-[11px] text-zinc-600">
                        Click to edit
                      </span>


                      <button
                        onClick={() =>
                          setSelectedNote(
                            note
                          )
                        }
                        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-orange-400"
                      >

                        <Pencil
                          size={12}
                        />

                        Edit

                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}


          {/* =================================================
              PAGINATION
          ================================================= */}

          {totalPages > 1 && (

            <div className="mt-10 flex items-center justify-center gap-5">

              <button
                onClick={() =>
                  setCurrentPage(
                    (previous) =>
                      Math.max(
                        previous - 1,
                        1
                      )
                  )
                }
                disabled={
                  currentPage === 1
                }
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>


              <span className="text-sm text-zinc-500">

                Page{" "}

                <span className="font-bold text-orange-400">
                  {currentPage}
                </span>

                {" "}of{" "}

                <span className="text-white">
                  {totalPages}
                </span>

              </span>


              <button
                onClick={() =>
                  setCurrentPage(
                    (previous) =>
                      Math.min(
                        previous + 1,
                        totalPages
                      )
                  )
                }
                disabled={
                  currentPage ===
                  totalPages
                }
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>

            </div>

          )}

        </section>

      </main>


      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {selectedNote && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">

          <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">


            <div className="mb-5 flex items-center justify-between border-b border-zinc-800 pb-4">

              <div>

                <p className="text-xs uppercase tracking-wider text-orange-500">
                  Edit Note
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Changes are saved to MongoDB.
                </p>

              </div>


              <button
                onClick={() =>
                  setSelectedNote(null)
                }
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white"
              >

                <X size={18} />

              </button>

            </div>


            <form
              onSubmit={
                handleUpdateNote
              }
              className="space-y-5"
            >

              <input
                type="text"
                name="title"
                value={
                  selectedNote.title
                }
                onChange={
                  handleModalChange
                }
                className="w-full bg-transparent text-2xl font-bold text-white outline-none focus:text-orange-400"
              />


              <textarea
                name="description"
                value={
                  selectedNote.description
                }
                onChange={
                  handleModalChange
                }
                rows={10}
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm leading-7 text-zinc-300 outline-none focus:border-orange-500/40"
              />


              <div className="flex items-center justify-between border-t border-zinc-800 pt-5">


                <button
                  type="button"
                  onClick={() =>
                    handleDeleteNote(
                      selectedNote._id
                    )
                  }
                  className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500 hover:text-white"
                >

                  <Trash2 size={15} />

                  Delete

                </button>


                <div className="flex gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedNote(null)
                    }
                    className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700"
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
                  >

                    {isUpdating
                      ? "Saving..."
                      : "Save Changes"}

                  </button>

                </div>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


export default Dashboard;