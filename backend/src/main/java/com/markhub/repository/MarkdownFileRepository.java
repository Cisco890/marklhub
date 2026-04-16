package com.markhub.repository;

import com.markhub.entity.Folder;
import com.markhub.entity.MarkdownFile;
import com.markhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MarkdownFileRepository extends JpaRepository<MarkdownFile, Long> {

    List<MarkdownFile> findByFolderOrderByNameAsc(Folder folder);

    List<MarkdownFile> findByFolderIdOrderByNameAsc(Long folderId);

    @Query(
            """
            SELECT mf FROM MarkdownFile mf
            WHERE mf.project.team.id = :teamId
            AND LOWER(mf.name) LIKE LOWER(CONCAT('%', :name, '%'))
            ORDER BY mf.name ASC
            """
    )
    List<MarkdownFile> searchByTeamAndNameContainingIgnoreCase(
            @Param("teamId") Long teamId,
            @Param("name") String name
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE MarkdownFile m SET m.createdBy = :replacement WHERE m.createdBy.id = :userId")
    void reassignCreatedBy(@Param("userId") Long userId, @Param("replacement") User replacement);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE MarkdownFile m SET m.updatedBy = :replacement WHERE m.updatedBy.id = :userId")
    void reassignUpdatedBy(@Param("userId") Long userId, @Param("replacement") User replacement);
}
